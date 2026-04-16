"""
Autonomous Red Team — runs attacks in the background without analyst intervention.
Agents pick attack types and targets on their own schedule.
"""
from __future__ import annotations
import asyncio, random, logging
from backend.models.schemas import AttackType
from backend.agents.registry import ATTACK_AGENT_MAP, DEFENSE_AGENT_MAP
from backend.models.schemas import AttackStatus, DefenseStatus

logger = logging.getLogger("red_team")

# All attack types the autonomous agents cycle through
ALL_ATTACKS = list(AttackType)

# Targets the red team simulates attacking
TARGETS = [
    "Enterprise Web Application",
    "Corporate VPN Gateway",
    "Internal LDAP Server",
    "Customer Database",
    "CI/CD Pipeline",
    "Email Server",
]

# Will be injected from routes.py
_attacks_store:  list = []
_defenses_store: list = []
_broadcast_fn = None


def init_autonomous(attacks_store, defenses_store, broadcast_fn):
    global _attacks_store, _defenses_store, _broadcast_fn
    _attacks_store  = attacks_store
    _defenses_store = defenses_store
    _broadcast_fn   = broadcast_fn


async def run_autonomous_red_team():
    """
    Background task — Red Team agents autonomously launch attacks
    every 30-90 seconds without any analyst interaction.
    """
    logger.info("🔴 Autonomous Red Team started")
    await asyncio.sleep(10)  # initial delay on startup

    while True:
        try:
            attack_type = random.choice(ALL_ATTACKS)
            target      = random.choice(TARGETS)
            agent       = ATTACK_AGENT_MAP[attack_type]

            logger.info(f"🔴 {agent.name} launching {attack_type.value} on {target}")

            # Execute attack via Gemini 3 Flash
            attack = await agent.execute_attack(attack_type, target)
            _attacks_store.append(attack)

            if _broadcast_fn:
                await _broadcast_fn("attack_initiated", attack.model_dump())

            # Progress: INITIATED → IN_PROGRESS
            await asyncio.sleep(3)
            attack.status = AttackStatus.IN_PROGRESS
            if _broadcast_fn:
                await _broadcast_fn("attack_updated", attack.model_dump())

            # Progress: IN_PROGRESS → DETECTED
            await asyncio.sleep(3)
            attack.status = AttackStatus.DETECTED
            if _broadcast_fn:
                await _broadcast_fn("attack_updated", attack.model_dump())

            # Trigger automated Blue Team defense
            asyncio.create_task(_auto_defend(attack))

        except Exception as e:
            logger.error(f"Red Team error: {e}")

        # Wait 30-90 seconds before next attack
        await asyncio.sleep(random.randint(30, 90))


async def _auto_defend(attack):
    """Blue Team automatically responds to every detected attack."""
    defense_agent = DEFENSE_AGENT_MAP.get(attack.type)
    if not defense_agent:
        return

    if _broadcast_fn:
        await _broadcast_fn("defense_started", {
            "attack_id": attack.id,
            "agent": defense_agent.name
        })

    try:
        defense = await defense_agent.analyze_and_defend(attack)
        _defenses_store.append(defense)

        if _broadcast_fn:
            await _broadcast_fn("defense_analyzing", defense.model_dump())

        await asyncio.sleep(2)
        defense.status = DefenseStatus.MITIGATING
        if _broadcast_fn:
            await _broadcast_fn("defense_updated", defense.model_dump())

        await asyncio.sleep(2)
        success = random.random() > 0.15  # 85% block rate
        defense.status = DefenseStatus.BLOCKED if success else DefenseStatus.FAILED
        attack.status  = AttackStatus.BLOCKED  if success else AttackStatus.SUCCESS

        if _broadcast_fn:
            await _broadcast_fn("defense_completed", defense.model_dump())
            await _broadcast_fn("attack_updated",    attack.model_dump())

    except Exception as e:
        logger.error(f"Defense error: {e}")
