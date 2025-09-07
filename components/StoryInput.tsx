
import React from 'react';
import type { VisualStyle } from '../types';

interface StoryInputProps {
  story: string;
  onStoryChange: (story: string) => void;
  storyPrompt: string;
  onStoryPromptChange: (prompt: string) => void;
  onGenerateStory: () => void;
  isGeneratingStory: boolean;
  onGenerate: () => void;
  onClear: () => void;
  isLoading: boolean;
  visualStyle: VisualStyle;
  onVisualStyleChange: (style: VisualStyle) => void;
  hasResult: boolean;
}

const visualStyles: VisualStyle[] = ['Default', 'Cartoonish', 'Realistic', 'Anime', 'Vintage'];

const StoryInput: React.FC<StoryInputProps> = ({
  story,
  onStoryChange,
  storyPrompt,
  onStoryPromptChange,
  onGenerateStory,
  isGeneratingStory,
  onGenerate,
  onClear,
  isLoading,
  visualStyle,
  onVisualStyleChange,
  hasResult,
}) => {
  const isAnyLoading = isLoading || isGeneratingStory;

  return (
    <div className="flex flex-col space-y-8 p-4">

      <div>
        <label htmlFor="story-textarea" className="block text-lg font-semibold text-slate-200 mb-2">Your Story</label>
        <textarea
          id="story-textarea"
          value={story}
          onChange={(e) => onStoryChange(e.target.value)}
          placeholder="A brave knight enters a dark cave, searching for a legendary sword..."
          className="w-full h-48 p-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-none"
          disabled={isAnyLoading}
        />
      </div>

      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <label htmlFor="story-prompt-input" className="block text-lg font-semibold text-slate-200 mb-2">Need inspiration?</label>
        <p className="text-sm text-slate-400 mb-3">Give the AI a prompt and it will write a short story for you.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="story-prompt-input"
            type="text"
            value={storyPrompt}
            onChange={(e) => onStoryPromptChange(e.target.value)}
            placeholder="e.g., A robot learning to bake a cake"
            className="flex-grow p-3 bg-slate-800 border-2 border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
            disabled={isAnyLoading}
          />
          <button
            onClick={onGenerateStory}
            disabled={isAnyLoading || !storyPrompt.trim()}
            className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGeneratingStory ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
            {isGeneratingStory ? 'Writing...' : 'Write for Me'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Choose Visual Style</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {visualStyles.map((style) => (
            <button
              key={style}
              onClick={() => onVisualStyleChange(style)}
              disabled={isAnyLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                visualStyle === style
                  ? 'bg-cyan-600 text-white shadow-lg ring-2 ring-cyan-400'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div>
         <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onGenerate}
            disabled={isAnyLoading || !story.trim()}
            className="flex-grow px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586zM12 6a2 2 0 100-4 2 2 0 000 4zM6 12a2 2 0 100-4 2 2 0 000 4zM12 18a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            {isLoading ? 'Generating...' : (hasResult ? 'Regenerate' : 'Generate')}
          </button>
          <button
            onClick={onClear}
            disabled={isAnyLoading || (!story.trim() && !hasResult)}
            className="px-6 py-3 bg-slate-600/50 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryInput;
