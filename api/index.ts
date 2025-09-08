// This file should be placed at `api/index.ts`
// It acts as a serverless function (e.g., on Vercel) to securely handle API requests.

import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { PanelDescription, VisualStyle } from '../types';

/**
 * Main handler for the serverless function. It expects a POST request
 * with a JSON body containing `action` and `payload`.
 */
export default async function handler(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { action, payload } = await request.json();
        let result;

        switch (action) {
            case 'isContentInappropriate':
                result = await isContentInappropriate(payload.text);
                break;
            case 'translateToEnglish':
                result = await translateToEnglish(payload.text);
                break;
            case 'generateStory':
                result = await generateStory(payload.prompt);
                break;
            case 'generatePanelBreakdown':
                result = await generatePanelBreakdown(payload.story);
                break;
            case 'generateComicPage':
                result = await generateComicPage(payload.descriptions, payload.style);
                break;
            default:
                return new Response(JSON.stringify({ error: 'Invalid action specified' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
        }

        return new Response(JSON.stringify({ result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error(`API Error on action:`, error);
        return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}


// --- All Gemini API logic is now securely on the backend ---

let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (ai) {
    return ai;
  }
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not configured on the server.");
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai;
}

const MODERATION_PROMPT = `
Analyze the following text. Does it contain sexually explicit, pornographic, or otherwise inappropriate content unsuitable for a general audience?
Respond with only "YES" or "NO".
`;

const isContentInappropriate = async (text: string): Promise<boolean> => {
  if (!text.trim()) {
    return false;
  }
  const client = getAiClient();
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${MODERATION_PROMPT}\n\nTEXT: ${text}`,
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      maxOutputTokens: 5,
    },
  });
  const decision = response.text.trim().toUpperCase();
  return decision === 'YES';
};


const TRANSLATE_TO_ENGLISH_PROMPT = `
Translate the following text to English.
Return only the translated text, without any preamble or explanation.
`;

const translateToEnglish = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return text;
  }
  const client = getAiClient();
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${TRANSLATE_TO_ENGLISH_PROMPT}\n\nTEXT: ${text}`,
    config: {
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return response.text.trim();
};


const STORY_GENERATION_PROMPT = `
You are a creative storyteller for comics.
Based on the following prompt, write a short story of about 3-5 sentences.
The story should be simple, with a clear beginning, middle, and end.
It needs to be suitable for being turned into a short visual comic strip of 3-6 panels.
Focus on clear actions and visual moments. Do not include panel descriptions, just the story text.
`;

const generateStory = async (prompt: string): Promise<string> => {
    const client = getAiClient();
    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${STORY_GENERATION_PROMPT}\n\nPROMPT: ${prompt}`,
    });
    return response.text.trim();
};

const STORY_BREAKDOWN_PROMPT = `
You are a storyboard artist. Your task is to break down the following story into a series of distinct comic book panels.
For each panel, provide a detailed visual description suitable for an image generation AI, and a short caption or dialogue.
The visual description should be rich with details about characters, actions, setting, and mood. Ensure character descriptions are consistent.
The caption should be the dialogue or a short narrative text for that panel.
Do not generate the images, only the structured data.
`;

const generatePanelBreakdown = async (story: string): Promise<PanelDescription[]> => {
  const client = getAiClient();
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${STORY_BREAKDOWN_PROMPT}\n\nSTORY:\n${story}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          panels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                panel: {
                  type: Type.INTEGER,
                  description: "The sequential number of the panel.",
                },
                visual_description: {
                  type: Type.STRING,
                  description: "A detailed visual description for the image generation AI.",
                },
                caption: {
                  type: Type.STRING,
                  description: "The dialogue or narrative caption for the panel.",
                },
              },
              required: ["panel", "visual_description", "caption"],
            },
          },
        },
      },
    },
  });
  const jsonText = response.text.trim();
  const parsed = JSON.parse(jsonText);
  return parsed.panels as PanelDescription[];
};

const getStylePrompt = (style: VisualStyle): string => {
  switch (style) {
    case 'Cartoonish':
      return 'a vibrant, slightly cartoonish comic book art style with clean lines and dynamic shading';
    case 'Realistic':
      return 'a photorealistic style, with detailed textures, cinematic lighting, and a grounded color palette';
    case 'Anime':
      return 'a classic Japanese anime style, with expressive characters, cel-shading, and dynamic action lines';
    case 'Vintage':
      return 'a retro, vintage comic book style from the 1960s, using halftone dots, limited color palettes, and bold ink lines';
    case 'Default':
    default:
      return 'a clean, modern comic book art style';
  }
};

const generateComicPage = async (
  descriptions: PanelDescription[],
  style: VisualStyle
): Promise<{ imageBase64: string; mimeType: string }> => {
  const client = getAiClient();
  const stylePrompt = getStylePrompt(style);

  const panelPrompts = descriptions.map(d => 
    `Panel ${d.panel}:\nVisuals: ${d.visual_description}\nCaption: "${d.caption}"`
  ).join('\n\n');

  const fullPrompt = `
    You are an expert comic book artist.
    Create a single image that is a complete comic book page.
    The page must follow this visual style: ${stylePrompt}.
    Arrange the ${descriptions.length} panels in a logical grid layout (e.g., 2x2, 3x1, etc., based on the number of panels).
    The panels should be clearly separated by gutters.
    The characters and art style must be consistent across all panels.
    Render the specified captions inside speech bubbles or caption boxes within each respective panel.

    Here are the descriptions for each panel:
    ${panelPrompts}
  `;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: [{ text: fullPrompt }] },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });
  
  if (!response.candidates || response.candidates.length === 0) {
    const blockReason = response.promptFeedback?.blockReason;
    if (blockReason) {
      throw new Error(`Request was blocked. Reason: ${blockReason}. This is often due to content safety filters.`);
    }
    throw new Error("The model did not return any candidates. This could be due to a content safety filter blocking the request.");
  }
  
  const candidate = response.candidates[0];

  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      throw new Error(`Image generation failed. Reason: ${candidate.finishReason}. This is often caused by content safety filters.`);
    }
    throw new Error("The model's response did not contain any content parts. This may be due to content safety filters or an internal error.");
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return {
        imageBase64: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      };
    }
  }
  
  throw new Error("No image was generated by the model. The response may have contained only text.");
};
