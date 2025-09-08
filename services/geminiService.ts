
import type { PanelDescription, VisualStyle } from '../types';

// Helper function to communicate with our backend API proxy
async function apiCall<T>(action: string, payload: unknown): Promise<T> {
  try {
    const response = await fetch('/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Use the error message from the backend, or a default
      throw new Error(data.error || 'An error occurred with the API request.');
    }

    return data.result as T;
  } catch (error) {
    // Catch network errors or issues with fetch itself
    console.error(`API call failed for action "${action}":`, error);
    if (error instanceof Error) {
        throw new Error(`Network request failed: ${error.message}`);
    }
    throw new Error('An unknown network error occurred.');
  }
}

export const isContentInappropriate = async (text: string): Promise<boolean> => {
  if (!text.trim()) {
    return false;
  }
  return apiCall<boolean>('isContentInappropriate', { text });
};

export const translateToEnglish = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return text;
  }
  return apiCall<string>('translateToEnglish', { text });
};

export const generateStory = async (prompt: string): Promise<string> => {
  return apiCall<string>('generateStory', { prompt });
};

export const generatePanelBreakdown = async (story: string): Promise<PanelDescription[]> => {
  return apiCall<PanelDescription[]>('generatePanelBreakdown', { story });
};

export const generateComicPage = async (
  descriptions: PanelDescription[],
  style: VisualStyle
): Promise<{ imageBase64: string; mimeType: string }> => {
  return apiCall<{ imageBase64: string; mimeType: string }>('generateComicPage', { descriptions, style });
};
