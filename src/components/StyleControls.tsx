import React from 'react';
import useThumbnailStore from '../store/thumbnailStore';
import AssetLibrary from './AssetLibrary';

// Sample assets for the asset library
const sampleAssets = [
  {
    id: 'python',
    src: 'https://cdn-icons-png.flaticon.com/512/5968/5968350.png',
    name: 'Python',
    type: 'image',
    position: 'left',
  },
  {
    id: 'javascript',
    src: 'https://cdn-icons-png.flaticon.com/512/5968/5968292.png',
    name: 'JavaScript',
    type: 'image',
    position: 'right',
  },
  {
    id: 'java',
    src: 'https://cdn-icons-png.flaticon.com/512/5968/5968282.png',
    name: 'Java',
    type: 'image',
    position: 'left',
  },
  {
    id: 'git',
    src: 'https://cdn-icons-png.flaticon.com/512/5968/5968313.png',
    name: 'Git',
    type: 'image',
    position: 'right',
  },
  {
    id: 'postgres',
    src: 'https://cdn-icons-png.flaticon.com/512/5968/5968342.png',
    name: 'PostgreSQL',
    type: 'image',
    position: 'center',
  },
  {
    id: 'bootstrap',
    src: 'https://cdn-icons-png.flaticon.com/512/5968/5968672.png',
    name: 'Bootstrap',
    type: 'image',
    position: 'left',
  },
];

// Enhanced thumbnail styles with integrated color palettes
// Adjusted so 'tech-grid' and 'ar-dev-brand' look clearly distinct
const enhancedThumbnailStyles = [
  {
    id: 'high-impact',
    name: 'High Impact',
    backgroundColor: '#FF2D55',
    fontFamily: 'Impact',
    fontColor: '#FFFFFF',
    backgroundGradient: {
      enabled: true,
      colors: ['#FF2D55', '#FF6B00'],
      direction: 'to right'
    },
    fontShadow: {
      enabled: true,
      color: '#000000',
      blur: 0,
      offsetX: 4,
      offsetY: 4
    },
    fontOutlineWidth: 0,
    fontOutlineColor: '#000000',
    badgeStyle: 'rectangle',
    preview: '/styles/high-impact-preview.png',
    description: 'Attention-grabbing style with vibrant red-orange gradient'
  },
  {
    id: 'dark-code',
    name: 'Dark Code',
    backgroundColor: '#111827',
    fontFamily: 'Bebas Neue',
    fontColor: '#F3F4F6',
    backgroundGradient: {
      enabled: true,
      colors: ['#111827', '#1F2937'],
      direction: 'to bottom'
    },
    fontShadow: {
      enabled: false,
      color: '#000000',
      blur: 0,
      offsetX: 0,
      offsetY: 0
    },
    fontOutlineWidth: 0,
    fontOutlineColor: '#000000',
    badgeStyle: 'code',
    preview: '/styles/dark-code-preview.png',
    description: 'IDE-inspired dark theme for programming tutorials'
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    backgroundColor: '#000000',
    fontFamily: 'Courier New',
    fontColor: '#00FF00',
    backgroundGradient: {
      enabled: true,
      colors: ['#000000', '#0D1B0A'],
      direction: 'to bottom'
    },
    fontShadow: {
      enabled: true,
      color: '#00FF00',
      blur: 10,
      offsetX: 0,
      offsetY: 0
    },
    fontOutlineWidth: 0,
    fontOutlineColor: '#000000',
    badgeStyle: 'code',
    preview: '/styles/matrix-preview.png',
    description: 'Matrix-inspired style for hacking and cybersecurity content'
  },
  {
    id: 'ar-dev-brand',
    name: 'AR Dev Brand',
    backgroundColor: '#191c1b',
    // Smoother gradient that differs from tech-grid
    backgroundGradient: {
      enabled: true,
      colors: ['#191c1b', '#0D1B0A'],
      direction: 'to bottom'
    },
    fontFamily: 'Poppins, sans-serif',
    fontColor: '#fefffe',
    // Strong brand accent glow so it doesn't look identical to tech-grid
    fontShadow: {
      enabled: true,
      color: '#12a480',
      blur: 10,
      offsetX: 0,
      offsetY: 0
    },
    fontOutlineWidth: 2,
    fontOutlineColor: '#7ff8cf', // additional highlight to differentiate
    badgeStyle: 'floating',
    preview: '/styles/ar-dev-brand-preview.png',
    description: 'Branded style inspired by Antonio Rapozo Dev, with a brighter glow accent'
  },
];

const StyleControls = () => {
  const { style, updateStyle, setCurrentStep, addAsset, removeAsset } = useThumbnailStore();

  const applyThumbnailStyle = (styleId) => {
    const selectedStyle = enhancedThumbnailStyles.find(s => s.id === styleId);
    if (selectedStyle) {
      // Provide a default title/subtitle based on style for quick preview
      const defaultTitle = 
        styleId === 'matrix' ? 'LEARN REACT' : 
        styleId === 'terminal' ? '$ npm start' : 
        styleId === 'high-impact' ? 'REDUX MASTERY' : 
        styleId === 'dark-code' ? 'TypeScript Tips' : 
        styleId === 'purple-creative' ? 'React Hooks' : 
        styleId === 'green-success' ? 'Node.js Guide' : 
        styleId === 'modern-tech' ? 'API Design' : 
        styleId === 'ar-dev-brand' ? 'Antonio Rapozo Dev' : 
        'Custom Title';
        
      const defaultSubtitle = 
        styleId === 'matrix' ? 'Advanced Techniques' : 
        styleId === 'terminal' ? 'Starting a project' : 
        styleId === 'high-impact' ? 'State Management' : 
        styleId === 'dark-code' ? 'Top 5 Tricks' : 
        styleId === 'purple-creative' ? 'useEffect Explained' : 
        styleId === 'green-success' ? 'Performance Tuning' : 
        styleId === 'modern-tech' ? 'REST vs GraphQL' : 
        styleId === 'ar-dev-brand' ? 'Web Dev • AWS • Modern Apps' :
        'Your subtitle here';
      
      updateStyle({
        backgroundColor: selectedStyle.backgroundColor,
        fontFamily: selectedStyle.fontFamily,
        fontColor: selectedStyle.fontColor,
        backgroundGradient: selectedStyle.backgroundGradient,
        fontShadow: selectedStyle.fontShadow,
        fontOutlineWidth: selectedStyle.fontOutlineWidth,
        fontOutlineColor: selectedStyle.fontOutlineColor,
        badgeStyle: selectedStyle.badgeStyle,
        // Update the title and subtitle with default values
        title: defaultTitle,
        subtitle: defaultSubtitle
      });
    }
  };

  const handleAssetSelect = (asset) => {
    // Add the asset to the stage with default positioning
    addAsset({
      src: asset.src,
      type: asset.type,
      position: asset.position,
      x: 200,
      y: 200,
      width: 150,
      height: 150,
      rotation: 0,
      opacity: 1,
      zIndex: style.assets.length + 1,
    });
  };

  const handleContinue = () => {
    setCurrentStep(2);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Step 1: Choose a Style</h2>
      
      {/* Thumbnail Styles */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Templates</h3> 
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {enhancedThumbnailStyles.map(thumbnailStyle => (
            <div 
              key={thumbnailStyle.id}
              className="cursor-pointer bg-gray-800 p-3 rounded-lg hover:bg-gray-600 transition transform hover:scale-105 hover:shadow-lg"
              onClick={() => applyThumbnailStyle(thumbnailStyle.id)}
            >
              <div 
                className="w-full h-36 rounded mb-2 flex items-center justify-center relative overflow-hidden"
                style={{
                  background: thumbnailStyle.backgroundGradient.enabled 
                    ? `linear-gradient(${thumbnailStyle.backgroundGradient.direction}, ${thumbnailStyle.backgroundGradient.colors[0]}, ${thumbnailStyle.backgroundGradient.colors[1]})`
                    : thumbnailStyle.backgroundColor
                }}
              >
                <div className="flex flex-col items-center justify-center text-center px-3">
                  <span 
                    className="font-bold text-xl mb-1"
                    style={{
                      fontFamily: thumbnailStyle.fontFamily,
                      color: thumbnailStyle.fontColor,
                      textShadow: thumbnailStyle.fontShadow.enabled 
                        ? `${thumbnailStyle.fontShadow.offsetX}px ${thumbnailStyle.fontShadow.offsetY}px ${thumbnailStyle.fontShadow.blur}px ${thumbnailStyle.fontShadow.color}`
                        : 'none',
                      WebkitTextStroke: thumbnailStyle.fontOutlineWidth > 0 
                        ? `${thumbnailStyle.fontOutlineWidth}px ${thumbnailStyle.fontOutlineColor}` 
                        : 'none'
                    }}
                  >
                    {thumbnailStyle.id === 'matrix' ? 'LEARN REACT' : 
                     thumbnailStyle.id === 'terminal' ? '$ npm start' : 
                     thumbnailStyle.id === 'high-impact' ? 'REDUX MASTERY' : 
                     thumbnailStyle.id === 'dark-code' ? 'TypeScript Tips' : 
                     thumbnailStyle.id === 'purple-creative' ? 'React Hooks' : 
                     thumbnailStyle.id === 'green-success' ? 'Node.js Guide' : 
                     thumbnailStyle.id === 'modern-tech' ? 'API Design' : 
                     thumbnailStyle.id === 'ar-dev-brand' ? 'Antonio Rapozo Dev' :
                     'Custom Title'}
                  </span>
                  <span 
                    className="text-xs opacity-90"
                    style={{
                      fontFamily: thumbnailStyle.fontFamily,
                      color: thumbnailStyle.fontColor,
                      textShadow: thumbnailStyle.fontShadow.enabled 
                        ? `${thumbnailStyle.fontShadow.offsetX}px ${thumbnailStyle.fontShadow.offsetY}px ${thumbnailStyle.fontShadow.blur}px ${thumbnailStyle.fontShadow.color}`
                        : 'none'
                    }}
                  >
                    {thumbnailStyle.id === 'matrix' ? 'Advanced Techniques' : 
                     thumbnailStyle.id === 'terminal' ? 'Starting a project' : 
                     thumbnailStyle.id === 'high-impact' ? 'State Management' : 
                     thumbnailStyle.id === 'dark-code' ? 'Top 5 Tricks' : 
                     thumbnailStyle.id === 'purple-creative' ? 'useEffect Explained' : 
                     thumbnailStyle.id === 'green-success' ? 'Performance Tuning' : 
                     thumbnailStyle.id === 'modern-tech' ? 'REST vs GraphQL' : 
                     thumbnailStyle.id === 'ar-dev-brand' ? 'Web Dev • AWS • Modern Apps' :
                     'Your subtitle here'}
                  </span>
                </div>
                
                {/* Add a badge based on the badgeStyle */}
                {thumbnailStyle.badgeStyle !== 'none' && (
                  <div 
                    className={`absolute ${
                      thumbnailStyle.badgeStyle === 'pill' 
                        ? 'rounded-full px-3 py-1 text-xs bg-opacity-80 top-2 right-2 bg-blue-600' 
                        : thumbnailStyle.badgeStyle === 'rectangle' 
                        ? 'rounded-md px-2 py-1 text-xs bg-opacity-90 top-2 left-2 bg-red-500' 
                        : thumbnailStyle.badgeStyle === 'code' 
                        ? 'font-mono rounded-sm px-2 py-1 text-xs bg-opacity-70 bottom-2 left-2 bg-gray-800' 
                        : thumbnailStyle.badgeStyle === 'floating' 
                        ? 'rounded-md px-2 py-1 text-xs bg-opacity-90 bottom-2 right-2 bg-indigo-500'
                        : thumbnailStyle.badgeStyle === 'square'
                        ? 'px-2 py-1 text-xs bg-opacity-90 bottom-2 left-2 bg-gray-900'
                        : ''
                    }`}
                  >
                    Code
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-200">{thumbnailStyle.name}</p>
                <p className="text-xs text-gray-400 line-clamp-2">{thumbnailStyle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Assets section */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Developer Assets</h3>
        <p className="text-sm text-gray-300 mb-4">
          Add programming icons and tech logos to enhance your thumbnail
        </p>
        
        <AssetLibrary 
          assets={sampleAssets} 
          onSelect={handleAssetSelect} 
        />
        
        {style.assets.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Selected Assets</h4>
            <div className="bg-gray-800 p-3 rounded-lg">
              <ul className="divide-y divide-gray-700">
                {style.assets.map((asset) => (
                  <li key={asset.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={asset.src} 
                        alt="Asset" 
                        className="w-8 h-8 mr-2 object-contain" 
                      />
                      <span className="text-sm">{asset.position} position</span>
                    </div>
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Continue button */}
      <div className="pt-4">
        <button
          onClick={handleContinue}
          className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
        >
          Continue to Text Content
        </button>
      </div>
    </div>
  );
};

export default StyleControls;
