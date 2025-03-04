// src/components/VariationControls.tsx
import React, { useEffect, useRef } from 'react';
import useThumbnailStore from '../store/thumbnailStore';

const VariationControls = () => {
  const { 
    variations, 
    selectedVariationId, 
    generateVariations, 
    selectVariation,
    updateText,
    updateStyle,
    style,
    text
  } = useThumbnailStore();

  // Capture the original entry (baseline) when VariationControls first loads.
  const initialStyleRef = useRef(style);
  const initialTextRef = useRef(text);

  // Generate variations on first render if none exist
  useEffect(() => {
    if (variations.length === 0) {
      generateVariations();
    } else if (variations.length > 0 && !selectedVariationId) {
      // If variations exist but none is selected, select the first one
      handleVariationSelect(variations[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variations.length, selectedVariationId]);

  // Compute optimized text alignment based on asset positions.
  // If more assets are on the left, text is shifted right (and vice versa).
  const computeOptimizedAlignment = (assets = []) => {
    let leftCount = 0,
      rightCount = 0;
    assets.forEach(asset => {
      if (asset.position === 'left') leftCount++;
      else if (asset.position === 'right') rightCount++;
    });
    if (leftCount > rightCount) return { headlineAlignment: 'right', subtitleAlignment: 'right' };
    if (rightCount > leftCount) return { headlineAlignment: 'left', subtitleAlignment: 'left' };
    return { headlineAlignment: 'center', subtitleAlignment: 'center' };
  };

  // Apply the selected variation over the original (baseline) entry.
  const applySelectedVariation = (variationId: string) => {
    const variation = variations.find(v => v.id === variationId);
    if (variation) {
      const optimizedAlignment = computeOptimizedAlignment(variation.style.assets);
      
      // Always start with the baseline values, then merge in the variation’s modifications.
      const newStyle = {
        ...initialStyleRef.current,
        ...variation.style,
        assets: variation.style.assets ? variation.style.assets.map(asset => ({ ...asset })) : []
      };
      
      const newText = {
        ...initialTextRef.current,
        ...variation.text,
        // Override alignment based on asset analysis
        headlineAlignment: optimizedAlignment.headlineAlignment,
        subtitleAlignment: optimizedAlignment.subtitleAlignment
      };
      
      // Update the global store in one render cycle.
      updateStyle(newStyle);
      updateText(newText);
    }
  };

  // Select a variation and apply its settings
  const handleVariationSelect = (id: string) => {
    selectVariation(id);
    applySelectedVariation(id);
  };

  const handleRegenerateVariations = () => {
    // Backup current state in case we need to revert
    const currentStyleBackup = { ...style };
    const currentTextBackup = { ...text };
    
    generateVariations();
    
    // After regeneration, select the first variation based on the original entry.
    setTimeout(() => {
      if (variations.length > 0) {
        handleVariationSelect(variations[0].id);
      } else {
        updateStyle(currentStyleBackup);
        updateText(currentTextBackup);
      }
    }, 100);
  };

  // Find the currently selected variation
  const selectedVariation = variations.find(v => v.id === selectedVariationId);

  if (variations.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Step 3: Generate & Export</h2>
        <div className="flex flex-col items-center justify-center h-60 bg-gray-800 rounded-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-300">Generating thumbnail variations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Step 3: Generate & Export</h2>
      
      <div>
        <label className="block text-sm text-gray-300 mb-2">Select a Variation</label>
        <div className="grid grid-cols-1 gap-4 mb-6">
          {variations.map((variation) => (
            <button
              key={variation.id}
              onClick={() => handleVariationSelect(variation.id)}
              className={`p-3 border rounded-lg text-left transition ${
                selectedVariationId === variation.id
                  ? 'border-primary bg-primary bg-opacity-20'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">
                {variation.name || `Variation ${variations.indexOf(variation) + 1}`}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {(() => {
                  const alignment = computeOptimizedAlignment(variation.style.assets);
                  return `${alignment.headlineAlignment.charAt(0).toUpperCase() + alignment.headlineAlignment.slice(1)} aligned text`;
                })()}
                {variation.style.assets && variation.style.assets.length > 0 
                  ? `, ${variation.style.assets.length} asset${variation.style.assets.length > 1 ? 's' : ''}`
                  : ', no assets'}
              </div>
            </button>
          ))}
        </div>
        
        <button 
          onClick={handleRegenerateVariations}
          className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition mb-6"
        >
          Regenerate Variations
        </button>
      </div>

      {selectedVariation && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium mb-3">About This Variation</h3>
          <div className="mb-4">
            <p className="text-sm text-gray-300">
              This variation uses{' '}
              <strong>
                {computeOptimizedAlignment(selectedVariation.style.assets).headlineAlignment}
              </strong>{' '}
              aligned text.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {selectedVariation.style.assets && selectedVariation.style.assets.length > 0 
                ? `Assets: ${selectedVariation.style.assets.map((asset, index) => (
                    <span key={index}>
                      {asset.name || `Asset ${index + 1}`} ({asset.position}){' '}
                    </span>
                  ))}`
                : 'No assets in this variation.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariationControls;
