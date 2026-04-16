// ============================================================
// BASE AGENT
// Abstract base class all agents extend. Handles Gemini calls,
// memory management, and RAG context injection.
// ============================================================

import { GoogleGenAI } from '@google/genai';
import { AgentModel, AgentStatus, AgentMemory } from '../models/AgentModel';
import { RetrievalResult } from '../rag/ragEngine';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
export const geminiClient: GoogleGenAI | null =
  apiKey && apiKey !== 'YOUR_API_KEY_HERE'
    ? new GoogleGenAI({ apiKey })
    : null;

export const GEMINI_MODEL = 'gemini-1.5-flash-latest';

export abstract class BaseAgent {
  protected model: AgentModel;

  constructor(model: AgentModel) {
    this.model = model;
  }

  get id()     { return this.model.id; }
  get name()   { return this.model.name; }
  get status() { return this.model.status; }

  setStatus(status: AgentStatus) {
    this.model.status = status;
  }

  setTask(task: string) {
    this.model.currentTask = task;
  }

  addLog(entry: string) {
    const ts = new Date().toLocaleTimeString();
    this.model.logs = [`[${ts}] ${entry}`, ...this.model.logs].slice(0, 50);
    this.model.memory.shortTerm = [entry, ...this.model.memory.shortTerm].slice(0, 10);
  }

  learnPattern(pattern: string) {
    if (!this.model.memory.longTerm.includes(pattern)) {
      this.model.memory.longTerm = [pattern, ...this.model.memory.longTerm].slice(0, 30);
    }
  }

  getSnapshot(): AgentModel {
    return { ...this.model };
  }

  /** Build a full prompt = system prompt + training data + RAG context + user message */
  protected buildPrompt(userMessage: string, rag: RetrievalResult): string {
    return [
      this.model.systemPrompt,
      `\n\n--- AGENT TRAINING DATA ---\n${this.model.trainingData}\n---\n`,
      rag.context,
      `\n\nPrevious actions (short-term memory):\n${this.model.memory.shortTerm.slice(0, 5).join('\n') || 'None'}`,
      `\n\nLearned patterns (long-term memory):\n${this.model.memory.longTerm.slice(0, 5).join('\n') || 'None'}`,
      `\n\nCURRENT TASK:\n${userMessage}`
    ].join('');
  }

  /** Call Gemini with the full grounded prompt */
  protected async callGemini(prompt: string, temperature = 0.7): Promise<string> {
    if (!geminiClient) {
      throw new Error('Gemini API not configured. Set VITE_GEMINI_API_KEY in .env.local');
    }
    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { temperature, maxOutputTokens: 600 }
    });
    return response.text || '';
  }

  /** Parse JSON safely from Gemini response */
  protected parseJSON<T>(text: string, fallback: T): T {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]) as T; } catch { /* fall through */ }
    }
    return fallback;
  }
}
