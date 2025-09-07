
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import StoryInput from './components/StoryInput';
import Storyboard from './components/Storyboard';
import { generatePanelBreakdown, generateComicPage, generateStory, translateToEnglish, isContentInappropriate } from './services/geminiService';
import type { VisualStyle, PanelDescription } from './types';

const LOCAL_STORAGE_KEY = 'storyFrameData';

interface ComicPage {
  imageUrl: string;
  imageBase64: string;
  mimeType: string;
}

const App: React.FC = () => {
  const [story, setStory] = useState<string>('');
  const [storyPrompt, setStoryPrompt] = useState<string>('');
  const [comicPage, setComicPage] = useState<ComicPage | null>(null);
  const [panelDescriptions, setPanelDescriptions] = useState<PanelDescription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('Default');


  // Load state from local storage on initial render
  useEffect(() => {
    try {
      const savedDataJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDataJSON) {
        const savedData = JSON.parse(savedDataJSON);
        if (savedData.story) setStory(savedData.story);
        if (savedData.visualStyle) setVisualStyle(savedData.visualStyle);
      }
    } catch (e) {
      console.error("Failed to load data from local storage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
    }
  }, []);

  // Save state to local storage whenever it changes
  useEffect(() => {
    try {
      const dataToSave = { story, visualStyle };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save data to local storage", e);
    }
  }, [story, visualStyle]);

  const handleGenerateStory = useCallback(async () => {
    if (!storyPrompt.trim()) return;

    setIsGeneratingStory(true);
    setError(null);
    try {
      if (await isContentInappropriate(storyPrompt)) {
        throw new Error("The provided prompt seems to contain inappropriate content. Please try a different idea.");
      }

      const translatedPrompt = await translateToEnglish(storyPrompt);
      const generatedStory = await generateStory(translatedPrompt);
      setStory(generatedStory);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred while generating the story.");
    } finally {
      setIsGeneratingStory(false);
    }
  }, [storyPrompt]);
  
  const handleGenerate = useCallback(async () => {
    if (!story.trim()) return;

    setIsLoading(true);
    setError(null);
    setComicPage(null);
    setPanelDescriptions([]);
    
    try {
      setLoadingMessage('Checking content safety...');
      if (await isContentInappropriate(story)) {
        throw new Error("The story seems to contain inappropriate content. Please revise your story to proceed.");
      }

      setLoadingMessage('Translating and analyzing your story...');
      const translatedStory = await translateToEnglish(story);
      const descriptions = await generatePanelBreakdown(translatedStory);
      
      if (!descriptions || descriptions.length === 0) {
        throw new Error("Could not generate a storyboard from the provided text.");
      }
      setPanelDescriptions(descriptions);

      setLoadingMessage('Drawing your comic page...');
      const { imageBase64, mimeType } = await generateComicPage(
        descriptions,
        visualStyle
      );

      setComicPage({
        imageUrl: `data:${mimeType};base64,${imageBase64}`,
        imageBase64: imageBase64,
        mimeType: mimeType,
      });

    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [story, visualStyle]);

  const handleClear = useCallback(() => {
    setStory('');
    setStoryPrompt('');
    setComicPage(null);
    setPanelDescriptions([]);
    setError(null);
    setVisualStyle('Default');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <main className="container mx-auto px-4 py-8">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1 bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-2xl shadow-slate-950/50">
            <StoryInput
              story={story}
              onStoryChange={setStory}
              storyPrompt={storyPrompt}
              onStoryPromptChange={setStoryPrompt}
              onGenerateStory={handleGenerateStory}
              isGeneratingStory={isGeneratingStory}
              onGenerate={handleGenerate}
              onClear={handleClear}
              isLoading={isLoading}
              visualStyle={visualStyle}
              onVisualStyleChange={setVisualStyle}
              hasResult={comicPage !== null}
            />
          </div>
          <div className="lg:col-span-2 bg-slate-800 min-h-[500px] rounded-xl border border-slate-700 shadow-2xl shadow-slate-950/50 overflow-y-auto relative">
            <Storyboard
              comicPage={comicPage}
              panelDescriptions={panelDescriptions}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
