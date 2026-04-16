"""
RAG Engine — ChromaDB vector store with sentence-transformer embeddings.
Retrieves relevant cybersecurity knowledge to ground agent prompts.
"""
from __future__ import annotations
import chromadb
from chromadb.utils import embedding_functions
from .knowledge_base import KNOWLEDGE_BASE, KnowledgeChunk

# ── Singleton ChromaDB client ─────────────────────────────────
_client: chromadb.Client | None = None
_collection = None
COLLECTION_NAME = "cybersentinel_kb"


def _get_collection():
    global _client, _collection
    if _collection is not None:
        return _collection

    _client = chromadb.Client()  # in-memory for hackathon

    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"   # fast, lightweight, good quality
    )

    _collection = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )

    # Populate if empty
    if _collection.count() == 0:
        _collection.add(
            ids=[c.id for c in KNOWLEDGE_BASE],
            documents=[f"{c.title}\n{c.content}" for c in KNOWLEDGE_BASE],
            metadatas=[{"category": c.category, "tags": ",".join(c.tags)} for c in KNOWLEDGE_BASE],
        )

    return _collection


# ── Public API ────────────────────────────────────────────────

class RetrievalResult:
    def __init__(self, chunks: list[KnowledgeChunk], context: str, source_ids: list[str]):
        self.chunks     = chunks
        self.context    = context
        self.source_ids = source_ids


def retrieve(query: str, top_k: int = 3, category: str | None = None) -> RetrievalResult:
    """Retrieve top-k relevant knowledge chunks for a query."""
    col = _get_collection()

    where = {"category": category} if category else None
    results = col.query(
        query_texts=[query],
        n_results=min(top_k, col.count()),
        where=where,
    )

    ids       = results["ids"][0]
    metadatas = results["metadatas"][0]

    # Map back to KnowledgeChunk objects
    chunk_map = {c.id: c for c in KNOWLEDGE_BASE}
    chunks    = [chunk_map[i] for i in ids if i in chunk_map]

    context = ""
    if chunks:
        context = "\n\n--- RETRIEVED KNOWLEDGE (RAG) ---\n"
        context += "\n\n".join(f"[{c.id}] {c.title}:\n{c.content}" for c in chunks)
        context += "\n--- END RETRIEVED KNOWLEDGE ---\n"

    return RetrievalResult(chunks=chunks, context=context, source_ids=ids)


def retrieve_for_attack(attack_type: str) -> RetrievalResult:
    return retrieve(f"{attack_type} attack technique payload exploit", top_k=3)


def retrieve_for_defense(attack_type: str, payload: str = "") -> RetrievalResult:
    return retrieve(f"{attack_type} {payload} defense mitigation detection", top_k=4)


def retrieve_for_orchestrator(context: str) -> RetrievalResult:
    return retrieve(f"{context} threat assessment strategic", top_k=3)
