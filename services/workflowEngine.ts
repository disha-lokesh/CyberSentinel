import { GoogleGenAI } from "@google/genai";
import { executeMCPTool, MCP_TOOLS } from './mcpMock';
import { WorkflowNode, WorkflowEvent } from '../types';

const apiKey = process.env.API_KEY || ''; 
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

// Convert MCP definitions to Gemini Tool format
const geminiTools = [{
  functionDeclarations: Object.values(MCP_TOOLS).map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }))
}];

export const runAgentStep = async (
  agentNode: WorkflowNode, 
  previousOutput: string, 
  onLog: (event: WorkflowEvent) => void
): Promise<string> => {
  
  onLog({
    id: Date.now().toString(),
    timestamp: Date.now(),
    nodeId: agentNode.id,
    type: 'INPUT',
    content: `Received input: ${previousOutput.substring(0, 100)}...`
  });

  if (!ai) {
    // Fallback simulation if no API key
    await new Promise(r => setTimeout(r, 1500));
    const mockThought = `[SIM] Processing ${previousOutput.substring(0, 20)}...`;
    onLog({ id: Date.now().toString(), timestamp: Date.now(), nodeId: agentNode.id, type: 'THOUGHT', content: mockThought });
    
    // Simulate tool call
    if (agentNode.label.includes("Recon")) return await executeMCPTool('network_scan', { target: '192.168.1.50' });
    if (agentNode.label.includes("Exploit")) return await executeMCPTool('exploit_generator', { cve: 'CVE-2021-41773' });
    if (agentNode.label.includes("Sensor")) return await executeMCPTool('log_analyzer', { logs: 'GET /cgi-bin/...' });
    if (agentNode.label.includes("Response")) return await executeMCPTool('firewall_update', { rule: 'Block IP', action: 'DROP' });
    
    return "Analysis complete.";
  }

  try {
    const systemPrompt = `You are an autonomous cybersecurity agent named ${agentNode.label}. 
    Your Role: ${agentNode.subLabel}.
    Goal: Process the input data, think step-by-step, and optionally use the provided MCP tools to achieve your objective.
    Input Data: ${previousOutput}
    
    Return a concise summary of your action and the result.`;

    // 1. Generate Content (Reasoning + potential Tool Call)
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: systemPrompt,
      config: {
        tools: geminiTools,
        temperature: 0.2,
      }
    });

    // 2. Check for Function Calls
    const functionCalls = response.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      onLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        nodeId: agentNode.id,
        type: 'TOOL_CALL',
        content: `Calling MCP Tool: ${call.name} with ${JSON.stringify(call.args)}`
      });

      // 3. Execute Tool
      const toolResult = await executeMCPTool(call.name, call.args);
      
      onLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        nodeId: agentNode.id,
        type: 'OUTPUT',
        content: `Tool Result: ${toolResult}`
      });

      return toolResult;
    } else {
      // Just text response
      const text = response.text || "No output generated.";
      onLog({
        id: Date.now().toString(),
        timestamp: Date.now(),
        nodeId: agentNode.id,
        type: 'THOUGHT',
        content: text
      });
      return text;
    }

  } catch (error) {
    console.error("Gemini Agent Error:", error);
    onLog({
      id: Date.now().toString(),
      timestamp: Date.now(),
      nodeId: agentNode.id,
      type: 'OUTPUT',
      content: "Error executing agent logic."
    });
    return "Error";
  }
};