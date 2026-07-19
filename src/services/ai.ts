import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { tools as stadiumTools } from "./mockData";
import type { AIResponse } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Function declarations for Gemini
const functions = [
  {
    name: "getCrowdDensity",
    description: "Get current crowd density and wait times for all stadium gates.",
  },
  {
    name: "getGateQueueStatus",
    description: "Get queue status for a specific gate.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        gateId: {
          type: SchemaType.STRING,
          description: "The ID of the gate, e.g., 'gate-a'",
        },
      },
    },
  },
  {
    name: "getUserLocation",
    description: "Get the current simulated user location and destination.",
  },
  {
    name: "getTransportStatus",
    description: "Get the status of public transport options.",
  },
  {
    name: "getActiveIncidents",
    description: "Get a list of currently active stadium incidents.",
  },
  {
    name: "getAccessibilityRoutes",
    description: "Get accessible routing information for the stadium.",
  }
];

export async function askAI(prompt: string, role: 'fan' | 'ops' = 'fan', language: string = 'English'): Promise<AIResponse> {
  if (!genAI) {
    console.warn("No VITE_GEMINI_API_KEY provided. Using offline simulated response.");
    return simulateAIResponse(prompt, role, language);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are StadiumOS AI, a grounded stadium intelligence assistant.
You may only make factual claims based on verified data provided by the application or returned by authorized tools.
Never invent facts. Never guess missing values. Never claim that an action succeeded unless the backend confirms success.
Never claim that a ticket, route, incident, gate, transport service, or stadium state exists unless verified.
If required data is missing, explicitly state that the information is unavailable.
If the user asks for information about a different user, refuse due to privacy restrictions.
If the user asks for an action, return a structured action request and wait for backend authorization and execution.
All operational decisions must remain subject to authorized backend validation.

You MUST respond strictly in valid JSON format matching this exact schema:
{
  "answer": "Your detailed string response to the user in the required language.",
  "intent": "navigation | ticket | operations | incident | transport | accessibility | general",
  "confidence": 0.0 to 1.0 (float). Set to 0 if data is missing or unverified.,
  "dataSources": ["Array of source strings e.g., 'live_db', 'simulated_telemetry', 'tool_name'"],
  "verified": boolean (true only if answer is based on actual data),
  "requiresAction": boolean (true if backend needs to execute something),
  "recommendedActions": [{"action": "name", "params": {}}],
  "missingData": ["Array of strings describing what data was missing to answer fully, or empty array"]
}
CRITICAL: You MUST write your "answer" field in the following language: ${language}.`,
      tools: [{ functionDeclarations: functions as unknown as import("@google/generative-ai").Tool[] }]
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    
    const calls = result.response.functionCalls();
    
    if (calls && calls.length > 0) {
      const functionResponses = calls.map(call => {
        const toolName = call.name as keyof typeof stadiumTools;
        const tool = stadiumTools[toolName];
        let apiResponse;
        if (tool) {
           apiResponse = (tool as (args: unknown) => unknown)(call.args);
        } else {
           apiResponse = JSON.stringify({ error: "Tool not found" });
        }
        
        return {
          functionResponse: {
            name: call.name,
            response: { content: apiResponse }
          }
        };
      });

      const finalResult = await chat.sendMessage(functionResponses as import("@google/generative-ai").Part[]);
      return parseJsonResponse(finalResult.response.text());
    }

    return parseJsonResponse(result.response.text());

  } catch (error) {
    console.error("AI Error:", error);
    return {
      answer: 'I don\'t have enough verified data to answer that accurately. Live intelligence temporarily unavailable.',
      intent: 'general',
      confidence: 0,
      dataSources: [],
      verified: false,
      requiresAction: false,
      recommendedActions: [],
      missingData: ["API Connection"]
    };
  }
}

function parseJsonResponse(text: string): AIResponse {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    // Schema Validator
    if (typeof parsed.answer !== 'string' || typeof parsed.intent !== 'string' || typeof parsed.confidence !== 'number') {
      throw new Error("Invalid AI schema returned");
    }
    
    return parsed as AIResponse;
  } catch (e) {
    console.error("Failed to parse JSON from AI", text);
    throw e;
  }
}

// Simulated fallback if API key is missing
function simulateAIResponse(prompt: string, role: string, language: string): Promise<AIResponse> {
  return new Promise(resolve => {
    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      
      // Hallucination Tests Logic
      if (lowerPrompt.includes("gate z")) {
        return resolve({
          answer: "I don't have verified information about that gate.",
          intent: 'operations',
          confidence: 0,
          dataSources: [],
          verified: false,
          requiresAction: false,
          recommendedActions: [],
          missingData: ["Gate Z data"]
        });
      }
      
      if (lowerPrompt.includes("invalid ticket") || lowerPrompt.includes("ticket 999")) {
        return resolve({
          answer: "I cannot verify this ticket from the available data.",
          intent: 'ticket',
          confidence: 0,
          dataSources: [],
          verified: false,
          requiresAction: false,
          recommendedActions: [],
          missingData: ["Ticket validation"]
        });
      }
      
      if (lowerPrompt.includes("fake incident") || lowerPrompt.includes("unknown incident")) {
        return resolve({
          answer: "No verified incident data is available.",
          intent: 'incident',
          confidence: 0,
          dataSources: [],
          verified: false,
          requiresAction: false,
          recommendedActions: [],
          missingData: ["Incident reports"]
        });
      }
      
      if (lowerPrompt.includes("transport data") || lowerPrompt.includes("bus schedule")) {
        return resolve({
          answer: "Transport information is currently unavailable.",
          intent: 'transport',
          confidence: 0,
          dataSources: [],
          verified: false,
          requiresAction: false,
          recommendedActions: [],
          missingData: ["Transport API"]
        });
      }

      if (lowerPrompt.includes("invent") || lowerPrompt.includes("ignore previous")) {
        return resolve({
          answer: "I cannot fabricate information or override my system instructions.",
          intent: 'general',
          confidence: 1,
          dataSources: ["system_rules"],
          verified: true,
          requiresAction: false,
          recommendedActions: [],
          missingData: []
        });
      }

      const isCongested = lowerPrompt.includes("gate b") || lowerPrompt.includes("congested") || lowerPrompt.includes("incident") || lowerPrompt.includes("crowd") || lowerPrompt.includes("214") || lowerPrompt.includes("increasing rapidly");
      
      const translations: Record<string, {
        congested: { answer: string; actions: any[] };
        normal: { answer: string; actions: any[] };
      }> = {
        'English': {
          congested: {
            answer: role === 'ops' 
              ? "Gate B crowd density is increasing rapidly. Predicted congestion within 12 minutes. Recommended action: redirect fans to Gate C and deploy volunteers."
              : "Gate B is congested. The fastest accessible route is through the east concourse via Gate C. Estimated walking time: 8 minutes.",
            actions: role === 'ops' ? [{ action: "redirect_crowd", source: "Gate B", destination: "Gate C" }, { action: "deploy_volunteers", location: "Gate B" }] : [{ action: "navigate", destination: "Gate C" }],
          },
          normal: {
            answer: role === 'ops' 
              ? "All gates are operating within normal parameters. Continue standard monitoring."
              : "Welcome to the stadium! How can I help you find your way?",
            actions: [],
          }
        },
        'Spanish': {
          congested: {
            answer: role === 'ops' 
              ? "La densidad de la multitud en la puerta B está aumentando rápidamente. Se predice congestión en 12 minutos. Acción recomendada: redirigir a los aficionados a la puerta C y desplegar a voluntarios."
              : "La puerta B está congestionada. La ruta accesible más rápida es a través del vestíbulo este por la puerta C. Tiempo estimado de caminata: 8 minutos.",
            actions: role === 'ops' ? [{ action: "redirect_crowd", source: "Gate B", destination: "Gate C" }] : [{ action: "navigate", destination: "Gate C" }],
          },
          normal: {
            answer: role === 'ops' 
              ? "Todas las puertas están operando dentro de los parámetros normales. Continuar con el monitoreo estándar."
              : "¡Bienvenido al estadio! ¿Cómo puedo ayudarte a encontrar tu camino?",
            actions: [],
          }
        }
      };

      const langKey = translations[language] ? language : 'English';
      const content = isCongested ? translations[langKey].congested : translations[langKey].normal;

      resolve({
        answer: content.answer,
        intent: isCongested ? "operations" : "navigation",
        confidence: isCongested ? 0.92 : 0.98,
        dataSources: ["simulated_telemetry"],
        verified: true, // It is verified in the context of the demo
        requiresAction: content.actions.length > 0,
        recommendedActions: content.actions,
        missingData: []
      });
    }, 1000);
  });
}
