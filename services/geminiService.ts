import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { GeminiModel, ChatMessage } from '../types';

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

interface LiveSessionCallbacks {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}

export const connectLiveSession = (callbacks: LiveSessionCallbacks) => {
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
            systemInstruction: 'You are a helpful and friendly sales training assistant. Guide the user through sales scenarios.',
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
};