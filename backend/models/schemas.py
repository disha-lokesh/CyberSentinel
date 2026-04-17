"""
Pydantic models — single source of truth for all data structures.
"""
from __future__ import annotations
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
import time


class AgentType(str, Enum):
    RED          = "RED"
    BLUE         = "BLUE"
    ORCHESTRATOR = "ORCHESTRATOR"


class AgentStatus(str, Enum):
    IDLE       = "IDLE"
    PLANNING   = "PLANNING"
    EXECUTING  = "EXECUTING"
    ANALYZING  = "ANALYZING"
    MITIGATING = "MITIGATING"


class AttackType(str, Enum):
    SQL_INJECTION        = "SQL Injection"
    XSS                  = "Cross-Site Scripting"
    BRUTE_FORCE          = "Brute Force"
    PHISHING             = "Phishing Campaign"
    RANSOMWARE           = "Ransomware Simulation"
    DDOS                 = "DDoS Attack"
    PRIVILEGE_ESCALATION = "Privilege Escalation"
    DATA_EXFILTRATION    = "Data Exfiltration"


class AttackStatus(str, Enum):
    INITIATED   = "INITIATED"
    IN_PROGRESS = "IN_PROGRESS"
    DETECTED    = "DETECTED"
    BLOCKED     = "BLOCKED"
    SUCCESS     = "SUCCESS"


class DefenseStatus(str, Enum):
    ANALYZING  = "ANALYZING"
    MITIGATING = "MITIGATING"
    BLOCKED    = "BLOCKED"
    FAILED     = "FAILED"


class AgentCapability(BaseModel):
    name:        str
    description: str
    confidence:  int = Field(ge=0, le=100)


class AgentMemory(BaseModel):
    short_term: list[str] = []
    long_term:  list[str] = []
    rag_chunks: list[str] = []


class AgentModel(BaseModel):
    id:           str
    name:         str
    role:         str
    type:         AgentType
    status:       AgentStatus = AgentStatus.IDLE
    current_task: str         = "Awaiting orders"
    efficiency:   int         = Field(default=90, ge=0, le=100)
    capabilities: list[AgentCapability] = []
    memory:       AgentMemory           = Field(default_factory=AgentMemory)
    logs:         list[str]             = []
    system_prompt:  str = ""
    training_data:  str = ""


class AttackResult(BaseModel):
    id:               str
    type:             AttackType
    agent_id:         str
    agent_name:       str
    timestamp:        float = Field(default_factory=time.time)
    target:           str
    strategy:         str
    payload:          str
    expected_impact:  str
    status:           AttackStatus = AttackStatus.INITIATED
    rag_sources_used: list[str]    = []
    logs:             list[str]    = []


class DefenseResult(BaseModel):
    id:               str
    attack_id:        str
    agent_id:         str
    agent_name:       str
    timestamp:        float = Field(default_factory=time.time)
    analysis:         str
    mitigation:       str
    confidence:       int   = Field(ge=0, le=100)
    status:           DefenseStatus = DefenseStatus.ANALYZING
    rag_sources_used: list[str]     = []
    cve_references:   list[str]     = []
    mitre_references: list[str]     = []


class OrchestratorDecision(BaseModel):
    timestamp:         float = Field(default_factory=time.time)
    threat_assessment: str
    recommendations:   list[str]
    vulnerabilities:   list[str]
    agent_directives:  dict[str, str] = {}
    rag_sources_used:  list[str]      = []


class LaunchAttackRequest(BaseModel):
    attack_type: AttackType
    target:      str = "Enterprise Web Application"


class WSMessage(BaseModel):
    event:   str
    payload: dict
