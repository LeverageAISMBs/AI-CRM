
import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateChatResponse = async (
  prompt: string,
  model: GeminiModel
): Promise<string> => {
  if (!ai) {
    return Promise.resolve("AI service is not configured. Please set the API_KEY.");
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI service.";
  }
};
