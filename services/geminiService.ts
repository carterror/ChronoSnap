import { GoogleGenAI } from "@google/genai";

// Ensure API key is present
const API_KEY = process.env.API_KEY || '';

export const generateTimeTravelImage = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Clean base64 string if it contains metadata header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using Flash Image for editing/transformation
      contents: {
        parts: [
          {
            text: prompt + " The output must be a high quality image. Maintain the person's facial features/identity as much as possible while fully adapting the style, clothing, and background to the requested era."
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          }
        ]
      }
    });

    // Extract the generated image
    // Note: The response structure for images in Gemini 2.5 Flash Image usually comes as inlineData in the candidate
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
