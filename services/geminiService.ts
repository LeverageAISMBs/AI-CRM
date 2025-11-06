import { GoogleGenAI, LiveServerMessage, Modality, Chat } from "@google/genai";
import { GeminiModel, ChatMessage, MapResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateChatResponse = async (
  prompt: string,
  model: GeminiModel
): Promise<Pick<ChatMessage, 'text' | 'sources'>> => {
  if (!ai) {
    return Promise.resolve({ text: "AI service is not configured. Please set the API_KEY." });
  }

  const useSearch = model === GeminiModel.FlashWithSearch;
  const actualModel = useSearch ? 'gemini-2.5-flash' : model;

  try {
    const response = await ai.models.generateContent({
      model: actualModel,
      contents: [{ parts: [{ text: prompt }] }],
      config: useSearch ? { tools: [{ googleSearch: {} }] } : undefined,
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return { text: response.text, sources };
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    if (error instanceof Error) {
        return { text: `Error: ${error.message}` };
    }
    return { text: "An unknown error occurred while contacting the AI service." };
  }
};


export const generateGroundedResponse = async (
  prompt: string,
  location: { latitude: number; longitude: number; }
): Promise<{ textResponse: string; mapResults: MapResult[] }> => {
  if (!ai) {
    throw new Error("AI service is not configured.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location,
          },
        },
      },
    });

    const textResponse = response.text;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const mapResults: MapResult[] = [];
    chunks.forEach((chunk, index) => {
      if (chunk.maps && chunk.maps.uri && chunk.maps.title) {
        mapResults.push({
          id: `map-result-${index}-${Date.now()}`,
          title: chunk.maps.title,
          uri: chunk.maps.uri,
        });
      }
    });

    return { textResponse, mapResults };
  } catch (error) {
    console.error("Error generating grounded response from Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI service.");
  }
};


export const createChatSession = (systemInstruction: string, model: GeminiModel = GeminiModel.Pro): Chat | null => {
    if (!ai) {
        console.warn("AI service not configured. Cannot create chat session.");
        return null;
    }
    // Don't use the audio model for a text chat. Default to Pro.
    const chatModel = model === GeminiModel.LiveAudio ? GeminiModel.Pro : model;

    return ai.chats.create({
        model: chatModel,
        config: {
            systemInstruction: systemInstruction,
        },
    });
};

interface LiveSessionCallbacks {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}

const DEFAULT_LIVE_SYSTEM_PROMPT = 'You are a helpful and friendly AI assistant.';

export const connectLiveSession = (callbacks: LiveSessionCallbacks, systemInstruction: string = DEFAULT_LIVE_SYSTEM_PROMPT) => {
    if (!ai) {
        throw new Error("AI service is not configured. Please set the API_KEY.");
    }

    return ai.live.connect({
        model: GeminiModel.LiveAudio,
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: systemInstruction,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
};