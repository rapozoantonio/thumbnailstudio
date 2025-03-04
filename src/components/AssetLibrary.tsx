// src/components/AssetLibrary.tsx
import React, { useState } from 'react';

interface Asset {
  src: string;
  name: string;
  type: string;
  position: 'left' | 'right' | 'center';
}

interface AssetLibraryProps {
  assets: Asset[];
  onSelect: (asset: Asset) => void;
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ assets, onSelect }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<'left' | 'right' | 'center'>('left');

  // Get unique asset types for category filtering
  const categories = ['all', ...Array.from(new Set(assets.map(asset => asset.type)))];

  // Filter assets based on category and search term
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = activeCategory === 'all' || asset.type === activeCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAssetSelect = (asset: Asset) => {
    // Create a new asset with the selected position
    const assetWithPosition = {
      ...asset,
      position: selectedPosition
    };
    onSelect(assetWithPosition);
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPosition(e.target.value as 'left' | 'right' | 'center');
  };

  return (
    <div className="space-y-4">
      {/* Search and position selector */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <div>
          <select
            value={selectedPosition}
            onChange={handlePositionChange}
            className="w-full bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="left">Left Aligned</option>
            <option value="right">Right Aligned</option>
            <option value="center">Center Aligned</option>
          </select>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
              activeCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-3 gap-3 max-h-52 overflow-y-auto p-1">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset, index) => (
            <div
              key={index}
              onClick={() => handleAssetSelect(asset)}
              className="bg-gray-800 p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors flex flex-col items-center"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-1">
                <img src={asset.src} alt={asset.name} className="max-w-full max-h-full object-contain" />
              </div>
              <span className="text-xs text-center text-gray-300 truncate w-full">{asset.name}</span>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-6 text-gray-400 text-sm">
            No assets found. Try a different search term.
          </div>
        )}
      </div>

      {/* Upload custom asset button */}
      <button
        className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 rounded-lg p-3 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-sm">Upload Custom Asset</span>
      </button>
    </div>
  );
};

export default AssetLibrary;
