"""
FastAPI routes — REST + WebSocket endpoints.
All AI work is delegated to Python agent classes.
"""
from __future__ import annotations
import asyncio, json, time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from backend.models.schemas import (
    LaunchAttackRequest, AttackResult, DefenseResult,
    AttackStatus, DefenseStatus,
)
from backend.agents.registry import (
    RED_AGENTS, BLUE_AGENTS, orchestrator,
    ATTACK_AGENT_MAP, DEFENSE_AGENT_MAP,
)

router = APIRouter()

# ── In-memory state (replace with Redis/DB for production) ────
_attacks:  list[AttackResult]  = []
_defenses: list[DefenseResult] = []
_ws_clients: list[WebSocket]   = []


async def _broadcast(event: str, payload: dict):
    """Push event to all connected WebSocket clients."""
    msg = json.dumps({"event": event, "payload": payload})
    dead = []
    for ws in _ws_clients:
        try:
            await ws.send_text(msg)
        except Exception:
            dead.append(ws)
    for ws in dead:
        _ws_clients.remove(ws)


# ── REST: agents ──────────────────────────────────────────────

@router.get("/agents/red")
def get_red_agents():
    return [a.snapshot() for a in RED_AGENTS]


@router.get("/agents/blue")
def get_blue_agents():
    return [a.snapshot() for a in BLUE_AGENTS]


@router.get("/agents/orchestrator")
def get_orchestrator():
    return orchestrator.snapshot()


# ── REST: attacks ─────────────────────────────────────────────

@router.post("/attack/launch")
async def launch_attack(req: LaunchAttackRequest):
    agent = ATTACK_AGENT_MAP.get(req.attack_type)
    if not agent:
        raise HTTPException(400, f"No agent for {req.attack_type}")

    # Execute attack via Gemini 3
    attack = await agent.execute_attack(req.attack_type, req.target)
    _attacks.append(attack)

    await _broadcast("attack_initiated", attack.model_dump())

    # Progress attack status asynchronously
    asyncio.create_task(_progress_attack(attack))

    return attack


async def _progress_attack(attack: AttackResult):
    """Simulate attack progression and trigger Blue Team response."""
    await asyncio.sleep(2)
    attack.status = AttackStatus.IN_PROGRESS
    attack.logs.append(f"[{time.strftime('%H:%M:%S')}] Status → IN_PROGRESS")
    await _broadcast("attack_updated", attack.model_dump())

    await asyncio.sleep(2)
    attack.status = AttackStatus.DETECTED
    attack.logs.append(f"[{time.strftime('%H:%M:%S')}] Status → DETECTED")
    await _broadcast("attack_updated", attack.model_dump())

    # Trigger automated Blue Team defense
    asyncio.create_task(_auto_defend(attack))


async def _auto_defend(attack: AttackResult):
    """Automatically trigger the best Blue Team agent."""
    defense_agent = DEFENSE_AGENT_MAP.get(attack.type)
    if not defense_agent:
        return

    await _broadcast("defense_started", {"attack_id": attack.id, "agent": defense_agent.name})

    defense = await defense_agent.analyze_and_defend(attack)
    _defenses.append(defense)
    await _broadcast("defense_analyzing", defense.model_dump())

    await asyncio.sleep(2)
    defense.status = DefenseStatus.MITIGATING
    await _broadcast("defense_updated", defense.model_dump())

    await asyncio.sleep(2)
    import random
    success = random.random() > 0.15   # 85% success rate
    defense.status = DefenseStatus.BLOCKED if success else DefenseStatus.FAILED
    attack.status  = AttackStatus.BLOCKED  if success else AttackStatus.SUCCESS
    await _broadcast("defense_completed", defense.model_dump())
    await _broadcast("attack_updated",    attack.model_dump())


# ── REST: defenses ────────────────────────────────────────────

@router.get("/defenses")
def get_defenses():
    return _defenses


@router.get("/attacks")
def get_attacks():
    return _attacks


# ── REST: orchestrator ────────────────────────────────────────

@router.post("/orchestrator/analyze")
async def orchestrator_analyze():
    decision = await orchestrator.analyze_system_state(
        attacks=_attacks,
        defenses=_defenses,
        red_agent_names=[a.name for a in RED_AGENTS],
        blue_agent_names=[a.name for a in BLUE_AGENTS],
    )
    await _broadcast("orchestrator_decision", decision.model_dump())
    return decision


# ── REST: reports ─────────────────────────────────────────────

@router.get("/reports/summary")
def get_report_summary():
    blocked = sum(1 for d in _defenses if d.status == DefenseStatus.BLOCKED)
    failed  = sum(1 for d in _defenses if d.status == DefenseStatus.FAILED)
    total   = len(_defenses)
    return {
        "total_attacks":   len(_attacks),
        "total_defenses":  total,
        "blocked":         blocked,
        "failed":          failed,
        "success_rate":    round(blocked / total * 100, 1) if total else 0,
        "attacks_by_type": _count_by_type(),
        "top_defender":    _top_defender(),
        "timeline":        _build_timeline(),
    }


def _count_by_type() -> dict:
    counts: dict[str, int] = {}
    for a in _attacks:
        counts[a.type.value] = counts.get(a.type.value, 0) + 1
    return counts


def _top_defender() -> dict:
    if not _defenses:
        return {}
    from collections import Counter
    names = [d.agent_name for d in _defenses if d.status == DefenseStatus.BLOCKED]
    if not names:
        return {}
    top = Counter(names).most_common(1)[0]
    return {"name": top[0], "blocks": top[1]}


def _build_timeline() -> list[dict]:
    events = []
    for a in _attacks[-10:]:
        events.append({"time": time.strftime("%H:%M", time.localtime(a.timestamp)),
                        "event": f"{a.type.value} by {a.agent_name}", "type": "attack"})
    for d in _defenses[-10:]:
        events.append({"time": time.strftime("%H:%M", time.localtime(d.timestamp)),
                        "event": f"{d.agent_name}: {d.mitigation[:60]}", "type": "defense"})
    return sorted(events, key=lambda x: x["time"], reverse=True)[:15]


# ── WebSocket ─────────────────────────────────────────────────

@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    _ws_clients.append(ws)
    try:
        # Send current state on connect
        await ws.send_text(json.dumps({
            "event": "connected",
            "payload": {
                "red_agents":  [a.snapshot() for a in RED_AGENTS],
                "blue_agents": [a.snapshot() for a in BLUE_AGENTS],
                "attacks":     [a.model_dump() for a in _attacks[-20:]],
                "defenses":    [d.model_dump() for d in _defenses[-20:]],
            }
        }))
        while True:
            await ws.receive_text()   # keep alive
    except WebSocketDisconnect:
        _ws_clients.remove(ws)
