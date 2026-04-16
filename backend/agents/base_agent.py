"""
BaseAgent — all agents inherit from this.
Uses google-genai SDK with Gemini 3 Flash for agents,
Gemini 3.1 Pro Preview for the orchestrator.
"""
from __future__ import annotations
import json, os, time
from google import genai
from google.genai import types
from dotenv import load_dotenv
from backend.models.schemas import AgentModel, AgentStatus, AgentMemory
from backend.rag.rag_engine import RetrievalResult

load_dotenv()

# ── Gemini 3 models ───────────────────────────────────────────
AGENT_MODEL       = "gemini-3-flash"          # fast agents
ORCHESTRATOR_MODEL = "gemini-3.1-pro-preview"  # deep reasoning

# ── Singleton Gemini client ───────────────────────────────────
_gemini_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set in environment")
        _gemini_client = genai.Client(api_key=api_key)
    return _gemini_client


class BaseAgent:
    """Abstract base — subclasses implement execute()."""

    def __init__(self, model: AgentModel):
        self.model = model

    # ── Properties ────────────────────────────────────────────
    @property
    def id(self):     return self.model.id
    @property
    def name(self):   return self.model.name
    @property
    def status(self): return self.model.status

    # ── State helpers ─────────────────────────────────────────
    def set_status(self, status: AgentStatus):
        self.model.status = status

    def set_task(self, task: str):
        self.model.current_task = task

    def add_log(self, entry: str):
        ts = time.strftime("%H:%M:%S")
        log_line = f"[{ts}] {entry}"
        self.model.logs = [log_line] + self.model.logs[:49]
        self.model.memory.short_term = [entry] + self.model.memory.short_term[:9]

    def learn(self, pattern: str):
        if pattern not in self.model.memory.long_term:
            self.model.memory.long_term = [pattern] + self.model.memory.long_term[:29]

    def snapshot(self) -> dict:
        return self.model.model_dump()

    # ── Prompt builder ────────────────────────────────────────
    def _build_prompt(self, task: str, rag: RetrievalResult) -> str:
        memory_ctx = "\n".join(self.model.memory.short_term[:5]) or "None"
        learned    = "\n".join(self.model.memory.long_term[:5])  or "None"
        return (
            f"{self.model.system_prompt}\n\n"
            f"--- AGENT TRAINING DATA ---\n{self.model.training_data}\n---\n"
            f"{rag.context}"
            f"\nShort-term memory:\n{memory_ctx}"
            f"\nLearned patterns:\n{learned}"
            f"\n\nCURRENT TASK:\n{task}"
        )

    # ── Gemini call ───────────────────────────────────────────
    async def _call_gemini(
        self,
        prompt: str,
        temperature: float = 0.7,
        model: str = AGENT_MODEL,
    ) -> str:
        client = get_client()
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=800,
            ),
        )
        return response.text or ""

    # ── JSON parser ───────────────────────────────────────────
    @staticmethod
    def _parse_json(text: str, fallback: dict) -> dict:
        import re
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        return fallback
