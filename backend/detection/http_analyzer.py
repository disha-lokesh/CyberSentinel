"""
Real HTTP Attack Detector
Analyzes actual HTTP requests from the AcmeCorp frontend for attack patterns.
This is what makes CyberSentinel real — not simulated, actual pattern matching
on live traffic with Gemini-powered contextual analysis.
"""
from __future__ import annotations
import re, time, uuid, logging
from dataclasses import dataclass, field
from backend.models.schemas import AttackType

logger = logging.getLogger("detector")


@dataclass
class DetectionRule:
    attack_type: AttackType
    name:        str
    patterns:    list[str]          # regex patterns
    severity:    str                # LOW | MEDIUM | HIGH | CRITICAL
    description: str


@dataclass
class DetectionResult:
    detected:    bool
    attack_type: AttackType | None
    rule_name:   str
    severity:    str
    evidence:    str                # what triggered it
    confidence:  int                # 0-100
    source_ip:   str
    target_path: str
    timestamp:   float = field(default_factory=time.time)


# ── Detection Rules ───────────────────────────────────────────
RULES: list[DetectionRule] = [
    DetectionRule(
        attack_type=AttackType.SQL_INJECTION,
        name="SQL Injection Pattern",
        severity="CRITICAL",
        description="SQL injection attempt detected in request parameters",
        patterns=[
            r"(?i)(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|delete\s+from)",
            r"(?i)(\bor\b\s+\d+=\d+|\band\b\s+\d+=\d+)",
            r"(?i)(--|#|/\*.*\*/)",
            r"(?i)(exec\s*\(|execute\s*\(|xp_cmdshell)",
            r"(?i)(sleep\s*\(|waitfor\s+delay|benchmark\s*\()",
            r"'.*'|\".*\"",  # quote injection
        ],
    ),
    DetectionRule(
        attack_type=AttackType.XSS,
        name="Cross-Site Scripting Pattern",
        severity="HIGH",
        description="XSS payload detected in request",
        patterns=[
            r"(?i)<script[^>]*>",
            r"(?i)javascript\s*:",
            r"(?i)on(load|error|click|mouseover|focus|blur)\s*=",
            r"(?i)<iframe[^>]*>",
            r"(?i)document\.(cookie|write|location)",
            r"(?i)eval\s*\(",
            r"(?i)<img[^>]+onerror",
        ],
    ),
    DetectionRule(
        attack_type=AttackType.BRUTE_FORCE,
        name="Brute Force Login Attempt",
        severity="HIGH",
        description="Repeated authentication failures indicating brute force",
        patterns=[
            r"(?i)(password|passwd|pwd)\s*=\s*['\"]?[a-z0-9]{1,8}['\"]?",
            r"(?i)admin|root|administrator|test|guest",
        ],
    ),
    DetectionRule(
        attack_type=AttackType.PRIVILEGE_ESCALATION,
        name="Path Traversal / LFI",
        severity="CRITICAL",
        description="Directory traversal or local file inclusion attempt",
        patterns=[
            r"\.\./|\.\.\\",
            r"(?i)/etc/(passwd|shadow|hosts)",
            r"(?i)(proc/self|/var/log|/etc/)",
            r"(?i)%2e%2e%2f|%252e%252e",
        ],
    ),
    DetectionRule(
        attack_type=AttackType.DATA_EXFILTRATION,
        name="Suspicious Data Access Pattern",
        severity="HIGH",
        description="Unusual bulk data access or exfiltration attempt",
        patterns=[
            r"(?i)(select\s+\*|dump|export|backup)",
            r"(?i)(base64|encode|decode)\s*\(",
            r"(?i)outfile|dumpfile|load_file",
        ],
    ),
    DetectionRule(
        attack_type=AttackType.PHISHING,
        name="Credential Harvesting Attempt",
        severity="MEDIUM",
        description="Suspicious form submission or credential harvesting",
        patterns=[
            r"(?i)(phish|harvest|steal|grab)",
            r"(?i)document\.cookie",
            r"(?i)window\.location\s*=",
        ],
    ),
]

# ── Rate tracking for brute force detection ───────────────────
_request_log: dict[str, list[float]] = {}   # ip → [timestamps]
_failed_logins: dict[str, int] = {}          # ip → count


def analyze_request(
    method:     str,
    path:       str,
    query:      str,
    body:       str,
    headers:    dict,
    source_ip:  str = "unknown",
) -> DetectionResult | None:
    """
    Analyze a real HTTP request for attack patterns.
    Returns DetectionResult if attack detected, None if clean.
    """
    # Combine all request data for scanning
    full_payload = f"{path} {query} {body}".strip()

    # Rate limiting check (brute force)
    now = time.time()
    _request_log.setdefault(source_ip, [])
    _request_log[source_ip] = [t for t in _request_log[source_ip] if now - t < 60]
    _request_log[source_ip].append(now)

    req_rate = len(_request_log[source_ip])
    if req_rate > 30:  # >30 requests/min from same IP
        return DetectionResult(
            detected=True,
            attack_type=AttackType.BRUTE_FORCE,
            rule_name="Rate Limit Exceeded",
            severity="HIGH",
            evidence=f"{req_rate} requests in 60s from {source_ip}",
            confidence=90,
            source_ip=source_ip,
            target_path=path,
        )

    # Pattern matching against all rules
    for rule in RULES:
        for pattern in rule.patterns:
            match = re.search(pattern, full_payload)
            if match:
                evidence = match.group(0)[:100]
                confidence = _calc_confidence(rule, full_payload, match)
                logger.warning(
                    f"🚨 {rule.name} detected from {source_ip} on {path} | "
                    f"Evidence: {evidence[:50]} | Confidence: {confidence}%"
                )
                return DetectionResult(
                    detected=True,
                    attack_type=rule.attack_type,
                    rule_name=rule.name,
                    severity=rule.severity,
                    evidence=f"Pattern '{pattern[:40]}' matched: {evidence}",
                    confidence=confidence,
                    source_ip=source_ip,
                    target_path=path,
                )

    return None  # Clean request


def _calc_confidence(rule: DetectionRule, payload: str, match) -> int:
    """Calculate detection confidence based on match quality."""
    base = 75
    # More patterns matched = higher confidence
    matched = sum(1 for p in rule.patterns if re.search(p, payload))
    base += min(matched * 5, 20)
    # Longer match = higher confidence
    if len(match.group(0)) > 20:
        base += 5
    return min(base, 99)


def record_failed_login(source_ip: str) -> int:
    """Track failed login attempts. Returns current count."""
    _failed_logins[source_ip] = _failed_logins.get(source_ip, 0) + 1
    return _failed_logins[source_ip]


def get_stats() -> dict:
    return {
        "tracked_ips": len(_request_log),
        "failed_logins": dict(list(_failed_logins.items())[:10]),
    }
