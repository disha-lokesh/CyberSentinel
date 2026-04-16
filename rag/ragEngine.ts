// ============================================================
// RAG ENGINE
// Retrieves relevant knowledge chunks based on query keywords
// and injects them into agent prompts as grounding context.
// ============================================================

import { KNOWLEDGE_BASE, KnowledgeChunk } from './knowledgeBase';

// Simple keyword-based retrieval (no vector DB needed client-side)
// In production this would use embeddings + cosine similarity
function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function score(chunk: KnowledgeChunk, queryTokens: string[]): number {
  const chunkText = [chunk.title, chunk.content, ...chunk.tags].join(' ').toLowerCase();
  let hits = 0;
  for (const token of queryTokens) {
    if (chunkText.includes(token)) hits++;
  }
  // Boost exact tag matches
  for (const tag of chunk.tags) {
    if (queryTokens.some(t => tag.includes(t) || t.includes(tag))) hits += 2;
  }
  return hits;
}

export interface RetrievalResult {
  chunks: KnowledgeChunk[];
  context: string;          // formatted string ready to inject into prompt
  sourceIds: string[];
}

/**
 * Retrieve top-k relevant knowledge chunks for a given query.
 * @param query  - natural language query or attack/defense type
 * @param topK   - number of chunks to return (default 3)
 * @param filter - optional category filter
 */
export function retrieve(
  query: string,
  topK = 3,
  filter?: KnowledgeChunk['category']
): RetrievalResult {
  const tokens = tokenize(query);

  let pool = filter
    ? KNOWLEDGE_BASE.filter(c => c.category === filter)
    : KNOWLEDGE_BASE;

  const scored = pool
    .map(chunk => ({ chunk, score: score(chunk, tokens) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const chunks = scored.map(x => x.chunk);

  const context = chunks.length > 0
    ? `\n\n--- RETRIEVED KNOWLEDGE (RAG) ---\n` +
      chunks.map(c => `[${c.id}] ${c.title}:\n${c.content}`).join('\n\n') +
      `\n--- END RETRIEVED KNOWLEDGE ---\n`
    : '';

  return {
    chunks,
    context,
    sourceIds: chunks.map(c => c.id)
  };
}

/**
 * Retrieve knowledge specifically for a Red Team attack type.
 */
export function retrieveForAttack(attackType: string): RetrievalResult {
  return retrieve(attackType, 3);
}

/**
 * Retrieve knowledge specifically for Blue Team defense.
 */
export function retrieveForDefense(attackType: string, payload: string): RetrievalResult {
  return retrieve(`${attackType} ${payload} defense mitigation`, 4);
}

/**
 * Retrieve knowledge for the Orchestrator strategic analysis.
 */
export function retrieveForOrchestrator(context: string): RetrievalResult {
  return retrieve(context, 3);
}
