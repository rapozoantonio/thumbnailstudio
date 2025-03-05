// src/components/ColorPicker.tsx
import React, { useState, useEffect, useRef } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Predefined color palette for software engineering thumbnails
  const presetColors = [
    '#1E293B', // Dark blue (background)
    '#0F172A', // Darker blue
    '#3B82F6', // Primary blue
    '#10B981', // Green
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#F59E0B', // Yellow/Amber
    '#EF4444', // Red
    '#FFFFFF', // White
    '#000000', // Black
  ];

  useEffect(() => {
    // Close color picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handlePresetSelect = (presetColor: string) => {
    onChange(presetColor);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div 
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="w-10 h-10 rounded border border-gray-600"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm">{color}</span>
      </div>

      {isOpen && (
        <div className="absolute top-12 left-0 z-10 p-3 bg-gray-700 border border-gray-700 rounded-lg shadow-xl w-64">
          <div className="mb-3">
            <label className="block text-sm text-gray-300 mb-2">Select Color</label>
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="w-full h-10 rounded cursor-pointer bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Preset Colors</label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <div
                  key={presetColor}
                  className="w-8 h-8 rounded border border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handlePresetSelect(presetColor)}
                />
              ))}
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm text-gray-300 mb-2">Hex Code</label>
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
