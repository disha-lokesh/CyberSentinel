import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client with Vite env variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; 
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
  ai = new GoogleGenAI({ apiKey });
  console.log('✅ Gemini API initialized');
} else {
  console.warn('⚠️ No Gemini API key found. Set VITE_GEMINI_API_KEY in .env.local');
}

export const isGeminiAvailable = (): boolean => {
  return ai !== null;
};

// Strategic Orchestrator - analyzes overall system state
export const generateStrategicDecision = async (context: string): Promise<string> => {
  if (!ai) {
    return `⚠️ Gemini API not configured. Please set VITE_GEMINI_API_KEY in .env.local to enable AI-powered strategic analysis.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'models/gemini-1.5-flash',
      contents: `You are the CyberSentinel Strategic Orchestrator AI.

CONTEXT:
${context}

TASK: Analyze the current Red Team attacks and Blue Team defenses. Provide:
1. Threat assessment (2-3 sentences)
2. Strategic recommendations for Blue Team
3. System vulnerabilities identified

Keep response concise, technical, and actionable. Format with clear sections.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });
    return response.text || "Analysis incomplete.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `⚠️ API Error: ${error.message || 'Failed to connect to Gemini API'}. Check your API key and quota.`;
  }
};

// Red Team Agent - generates attack strategies
export const generateRedTeamAttack = async (attackType: string, target: string): Promise<{
  strategy: string;
  payload: string;
  expectedImpact: string;
}> => {
  if (!ai) {
    return {
      strategy: `⚠️ Gemini API not configured. Set VITE_GEMINI_API_KEY in .env.local to enable AI-powered ${attackType} attacks.`,
      payload: 'API key required',
      expectedImpact: 'Configure Gemini API to generate real attack strategies'
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'models/gemini-1.5-flash',
      contents: `You are a Red Team AI agent specializing in ethical penetration testing.

ATTACK TYPE: ${attackType}
TARGET: ${target}

Generate a realistic attack strategy. Respond in JSON format:
{
  "strategy": "Brief description of attack approach (2-3 sentences)",
  "payload": "Technical payload or command (realistic but safe for simulation)",
  "expectedImpact": "What this attack would reveal or compromise"
}

Keep it technical and realistic for cybersecurity training.`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 300,
      }
    });
    
    const text = response.text || '{}';
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      strategy: text.substring(0, 200),
      payload: 'Generated payload',
      expectedImpact: 'System analysis'
    };
  } catch (error: any) {
    console.error("Red Team Agent Error:", error);
    return {
      strategy: `⚠️ API Error: ${error.message}`,
      payload: 'N/A',
      expectedImpact: 'Check API key and quota'
    };
  }
};

// Blue Team Agent - analyzes threats and generates defenses
export const generateBlueTeamResponse = async (
  threat: string,
  attackDetails: string
): Promise<{
  analysis: string;
  mitigation: string;
  confidence: number;
}> => {
  if (!ai) {
    return {
      analysis: '⚠️ Gemini API not configured. Set VITE_GEMINI_API_KEY to enable AI-powered threat analysis.',
      mitigation: 'Configure API key to enable automated defense',
      confidence: 0
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'models/gemini-1.5-flash',
      contents: `You are a Blue Team AI agent specializing in threat detection and response.

THREAT DETECTED: ${threat}
ATTACK DETAILS: ${attackDetails}

Analyze this threat and respond in JSON format:
{
  "analysis": "Technical analysis of the threat (2-3 sentences)",
  "mitigation": "Specific defensive action to take",
  "confidence": 85
}

Confidence should be 0-100. Be specific and actionable.`,
      config: {
        temperature: 0.6,
        maxOutputTokens: 300,
      }
    });
    
    const text = response.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      analysis: text.substring(0, 200),
      mitigation: 'Defensive measures applied',
      confidence: 75
    };
  } catch (error: any) {
    console.error("Blue Team Agent Error:", error);
    return {
      analysis: `⚠️ API Error: ${error.message}`,
      mitigation: 'Check API configuration',
      confidence: 0
    };
  }
};
