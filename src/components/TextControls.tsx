// src/components/TextControls.tsx
import React, { useState } from 'react';
import useThumbnailStore from '../store/thumbnailStore';

interface TextTemplate {
  id: string;
  label: string;
  headlinePosition: 'top' | 'middle' | 'bottom';
  headlineAlignment: 'left' | 'center' | 'right';
  subtitlePosition: 'belowHeadline' | 'aboveHeadline' | 'separate';
  subtitleAlignment: 'left' | 'center' | 'right';
}

const templates: TextTemplate[] = [
  {
    id: 'top-left',
    label: 'Top Left',
    headlinePosition: 'top',
    headlineAlignment: 'left',
    subtitlePosition: 'belowHeadline',
    subtitleAlignment: 'left',
  },
  {
    id: 'top-center',
    label: 'Top Center',
    headlinePosition: 'top',
    headlineAlignment: 'center',
    subtitlePosition: 'belowHeadline',
    subtitleAlignment: 'center',
  },
  {
    id: 'top-right',
    label: 'Top Right',
    headlinePosition: 'top',
    headlineAlignment: 'right',
    subtitlePosition: 'belowHeadline',
    subtitleAlignment: 'right',
  },
  {
    id: 'middle-center',
    label: 'Middle Center',
    headlinePosition: 'middle',
    headlineAlignment: 'center',
    subtitlePosition: 'belowHeadline',
    subtitleAlignment: 'center',
  },
  {
    id: 'bottom-left',
    label: 'Bottom Left',
    headlinePosition: 'bottom',
    headlineAlignment: 'left',
    subtitlePosition: 'aboveHeadline',
    subtitleAlignment: 'left',
  },
  {
    id: 'bottom-center',
    label: 'Bottom Center',
    headlinePosition: 'bottom',
    headlineAlignment: 'center',
    subtitlePosition: 'aboveHeadline',
    subtitleAlignment: 'center',
  },
  {
    id: 'bottom-right',
    label: 'Bottom Right',
    headlinePosition: 'bottom',
    headlineAlignment: 'right',
    subtitlePosition: 'aboveHeadline',
    subtitleAlignment: 'right',
  },
];

const TextControls: React.FC = () => {
  const { text, updateText, setCurrentStep } = useThumbnailStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      updateText({
        headlinePosition: template.headlinePosition,
        headlineAlignment: template.headlineAlignment,
        subtitlePosition: template.subtitlePosition,
        subtitleAlignment: template.subtitleAlignment,
      });
    }
  };

  const handleContinue = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const incrementSize = (type: 'headline' | 'subtitle') => {
    const size = type === 'headline' ? text.headlineSize : text.subtitleSize;
    const newSize = Math.min(size + 8, type === 'headline' ? 100 : 60);
    updateText({ [type === 'headline' ? 'headlineSize' : 'subtitleSize']: newSize });
  };

  const decrementSize = (type: 'headline' | 'subtitle') => {
    const size = type === 'headline' ? text.headlineSize : text.subtitleSize;
    const newSize = Math.max(size - 8, type === 'headline' ? 30 : 15);
    updateText({ [type === 'headline' ? 'headlineSize' : 'subtitleSize']: newSize });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Step 2: Text Content</h2>
      
      {/* Template Selector */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="font-medium mb-3">Select Text Position & Alignment</h3>
        <div className="grid grid-cols-3 gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateChange(template.id)}
              className={`px-4 py-2 rounded transition-all ${
                selectedTemplate === template.id
                  ? 'bg-primary border-2 border-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customization Controls */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="font-medium mb-3">Customize Your Text</h3>
        {/* Headline Input */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1" htmlFor="headlineInput">Headline</label>
          <input 
            id="headlineInput"
            type="text"
            value={text.headline}
            onChange={(e) => updateText({ headline: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter an engaging headline..."
          />
        </div>
        {/* Subtitle Input */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1" htmlFor="subtitleInput">Subtitle</label>
          <input 
            id="subtitleInput"
            type="text"
            value={text.subtitle}
            onChange={(e) => updateText({ subtitle: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter a compelling subtitle..."
          />
        </div>
        {/* Headline Size Controls */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Headline Size: {text.headlineSize}px</label>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => decrementSize('headline')}
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              -
            </button>
            <button
              onClick={() => incrementSize('headline')}
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        {/* Subtitle Size Controls */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Subtitle Size: {text.subtitleSize}px</label>
          <div className="flex space-x-2 justify-center">
            <button
              onClick={() => decrementSize('subtitle')}
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              -
            </button>
            <button
              onClick={() => incrementSize('subtitle')}
              className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-4 pt-4 justify-center">
        <button
          onClick={handleBack}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors max-w-xs"
        >
          Back to Step 1
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 bg-primary hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors max-w-xs"
        >
          Continue to Step 3
        </button>
      </div>
    </div>
  );
};

export default TextControls;