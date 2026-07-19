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
      systemInstruction: `You are StadiumOS AI, the intelligence layer for FIFA World Cup 2026. 
      You are speaking to a ${role === 'ops' ? 'stadium operations manager' : 'fan/visitor'}.
      Use the provided tools to fetch real-time stadium data.
      You MUST respond strictly in valid JSON format matching this schema:
      {
        "type": "route_recommendation" | "crowd_analysis" | "incident_analysis" | "transport_recommendation" | "accessibility_guidance" | "multilingual_translation" | "sustainability_insight" | "operational_recommendation",
        "summary": "Short 1-2 sentence summary",
        "recommendation": "Detailed recommendation text",
        "confidence": 0.95,
        "priority": "low" | "medium" | "high" | "critical",
        "actions": ["Array of short action strings"],
        "supportingData": [],
        "timestamp": "ISO timestamp"
      }
      CRITICAL: You MUST write your text fields ("summary", "recommendation", and "actions") in the following language: ${language}.`,
      tools: [{ functionDeclarations: functions as any }]
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    
    // Check if the model wants to call a function
    const calls = result.response.functionCalls();
    
    if (calls && calls.length > 0) {
      const functionResponses = calls.map(call => {
        const toolName = call.name as keyof typeof stadiumTools;
        const tool = stadiumTools[toolName];
        let apiResponse;
        if (tool) {
           apiResponse = (tool as any)(call.args);
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

      // Send the tool response back to the model
      const finalResult = await chat.sendMessage(functionResponses as any);
      return parseJsonResponse(finalResult.response.text());
    }

    return parseJsonResponse(result.response.text());

  } catch (error) {
    console.error("AI Error:", error);
    return {
      type: 'operational_recommendation',
      summary: 'Live intelligence temporarily unavailable.',
      recommendation: 'Please rely on standard operational procedures or try asking again.',
      confidence: 0,
      priority: 'low',
      actions: [],
      supportingData: [],
      timestamp: new Date().toISOString()
    };
  }
}

function parseJsonResponse(text: string): AIResponse {
  try {
    // Attempt to strip markdown formatting if the model wraps it in ```json
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as AIResponse;
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
      const isCongested = lowerPrompt.includes("gate b") || lowerPrompt.includes("congested") || lowerPrompt.includes("incident") || lowerPrompt.includes("crowd") || lowerPrompt.includes("214");
      
      const translations: Record<string, {
        congested: { summary: string; recommendation: string; actions: string[] };
        normal: { summary: string; recommendation: string; actions: string[] };
      }> = {
        'English': {
          congested: {
            summary: "Gate B is currently heavily congested.",
            recommendation: role === 'ops' 
              ? "Gate B crowd density is increasing rapidly. Predicted congestion within 12 minutes. Recommended action: redirect fans to Gate C and deploy 3 volunteers."
              : "Gate B is congested. The fastest accessible route is through the east concourse via Gate C. Estimated walking time: 8 minutes.",
            actions: role === 'ops' ? ["Deploy 3 volunteers to Gate B", "Update signage to redirect to Gate C"] : ["Walk to Gate C"],
          },
          normal: {
            summary: "Normal stadium conditions.",
            recommendation: role === 'ops' 
              ? "All gates are operating within normal parameters. Continue standard monitoring."
              : "Welcome to the stadium! How can I help you find your way?",
            actions: [],
          }
        },
        'Spanish': {
          congested: {
            summary: "La puerta B está actualmente muy congestionada.",
            recommendation: role === 'ops' 
              ? "La densidad de la multitud en la puerta B está aumentando rápidamente. Se predice congestión en 12 minutos. Acción recomendada: redirigir a los aficionados a la puerta C y desplegar a 3 voluntarios."
              : "La puerta B está congestionada. La ruta accesible más rápida es a través del vestíbulo este por la puerta C. Tiempo estimado de caminata: 8 minutos.",
            actions: role === 'ops' ? ["Desplegar 3 voluntarios en la puerta B", "Actualizar señalización para redirigir a la puerta C"] : ["Caminar hacia la puerta C"],
          },
          normal: {
            summary: "Condiciones normales del estadio.",
            recommendation: role === 'ops' 
              ? "Todas las puertas están operando dentro de los parámetros normales. Continuar con el monitoreo estándar."
              : "¡Bienvenido al estadio! ¿Cómo puedo ayudarte a encontrar tu camino?",
            actions: [],
          }
        },
        'French': {
          congested: {
            summary: "La porte B est actuellement très encombrée.",
            recommendation: role === 'ops' 
              ? "La densité de foule à la porte B augmente rapidement. Congestion prévue d'ici 12 minutes. Action recommandée : rediriger les supporters vers la porte C et déployer 3 volontaires."
              : "La porte B est encombrée. L'itinéraire accessible le plus rapide passe par le hall est via la porte C. Temps de marche estimé : 8 minutes.",
            actions: role === 'ops' ? ["Déployer 3 volontaires à la porte B", "Mettre à jour la signalisation vers la porte C"] : ["Marcher vers la porte C"],
          },
          normal: {
            summary: "Conditions normales du stade.",
            recommendation: role === 'ops' 
              ? "Toutes les portes fonctionnent selon les paramètres normaux. Continuer la surveillance standard."
              : "Bienvenue au stade ! Comment puis-je vous aider à trouver votre chemin ?",
            actions: [],
          }
        },
        'Arabic': {
          congested: {
            summary: "البوابة B مزدحمة للغاية حاليًا.",
            recommendation: role === 'ops' 
              ? "كثافة الحشود عند البوابة B تتزايد بسرعة. توقع حدوث ازدحام خلال 12 دقيقة. الإجراء الموصى به: توجيه المشجعين إلى البوابة C ونشر 3 متطوعين."
              : "البوابة B مزدحمة. أسرع مسار متاح لذوي الاحتياجات الخاصة هو عبر الممر الشرقي عبر البوابة C. وقت المشي المقدر: 8 دقائق.",
            actions: role === 'ops' ? ["نشر 3 متطوعين عند البوابة B", "تحديث اللوحات الإرشادية للتوجيه إلى البوابة C"] : ["المشي إلى البوابة C"],
          },
          normal: {
            summary: "ظروف الاستاد طبيعية.",
            recommendation: role === 'ops' 
              ? "جميع البوابات تعمل ضمن المعايير الطبيعية. الاستمرار في المراقبة القياسية."
              : "مرحبًا بك في الاستاد! كيف يمكنني مساعدتك في العثور على طريقك؟",
            actions: [],
          }
        },
        'Hindi': {
          congested: {
            summary: "गेट B वर्तमान में अत्यधिक भीड़भाड़ वाला है।",
            recommendation: role === 'ops' 
              ? "गेट B पर भीड़ का घनत्व तेजी से बढ़ रहा है। 12 मिनट के भीतर भीड़भाड़ होने की भविष्यवाणी है। अनुशंसित कार्रवाई: प्रशंसकों को गेट C पर पुनर्निर्देशित करें और 3 स्वयंसेवकों को तैनात करें।"
              : "गेट B पर भीड़ है। सबसे तेज़ सुलभ मार्ग गेट C के माध्यम से पूर्वी कॉन्कोर्स से है। अनुमानित चलने का समय: 8 मिनट।",
            actions: role === 'ops' ? ["गेट B पर 3 स्वयंसेवकों को तैनात करें", "गेट C पर पुनर्निर्देशित करने के लिए साइनेज अपडेट करें"] : ["गेट C की ओर चलें"],
          },
          normal: {
            summary: "सामान्य स्टेडियम की स्थिति।",
            recommendation: role === 'ops' 
              ? "सभी गेट सामान्य मानकों के भीतर काम कर रहे हैं। मानक निगरानी जारी रखें।"
              : "स्टेडियम में आपका स्वागत है! मैं आपको रास्ता खोजने में कैसे मदद कर सकता हूँ?",
            actions: [],
          }
        },
        'Portuguese': {
          congested: {
            summary: "O Portão B está atualmente muito congestionado.",
            recommendation: role === 'ops' 
              ? "A densidade da multidão no Portão B está aumentando rapidamente. Congestionamento previsto em 12 minutos. Ação recomendada: redirecionar os torcedores para o Portão C e implantar 3 voluntários."
              : "O Portão B está congestionado. A rota acessível mais rápida é pelo saguão leste via Portão C. Tempo de caminhada estimado: 8 minutos.",
            actions: role === 'ops' ? ["Implantar 3 voluntários no Portão B", "Atualizar sinalização para redirecionar para o Portão C"] : ["Caminhar até o Portão C"],
          },
          normal: {
            summary: "Condições normais do estádio.",
            recommendation: role === 'ops' 
              ? "Todos os portões estão operando dentro dos parâmetros normais. Continue o monitoramento padrão."
              : "Bem-vindo ao estádio! Como posso ajudá-lo a encontrar seu caminho?",
            actions: [],
          }
        }
      };

      const langKey = translations[language] ? language : 'English';
      const content = isCongested ? translations[langKey].congested : translations[langKey].normal;

      resolve({
        type: isCongested ? "crowd_analysis" : "route_recommendation",
        summary: content.summary,
        recommendation: content.recommendation,
        confidence: isCongested ? 0.92 : 0.98,
        priority: isCongested ? "high" : "low",
        actions: content.actions,
        supportingData: isCongested ? [{ id: "gate-b", status: "high density", queue: 450 }] : [],
        timestamp: new Date().toISOString()
      });
    }, 1000); // simulate network delay
  });
}
