// src/components/canvas/CanvasControls.tsx
import React from 'react';
import useThumbnailStore from '../../store/thumbnailStore';

// SVG icons for various actions
const GridIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
    <line x1="9" y1="3" x2="9" y2="21"></line>
    <line x1="15" y1="3" x2="15" y2="21"></line>
  </svg>
);

const AlignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="21" y1="10" x2="3" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="21" y1="18" x2="3" y2="18"></line>
  </svg>
);

// Component for a toggle button with icon, label, and tooltip
interface ToggleButtonProps {
  isEnabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  shortcut?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isEnabled, onClick, icon, label, tooltip, shortcut }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="relative">
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 ${
          isEnabled ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className="font-medium">{label}</span>
        <span className={`ml-1 px-1 text-xs rounded-sm ${isEnabled ? "bg-blue-600" : "bg-gray-300"}`}>
          {isEnabled ? "ON" : "OFF"}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute z-50 left-0 bottom-full mb-2 px-3 py-2 w-48 bg-gray-700 text-white text-xs rounded shadow-lg">
          {tooltip}
          {shortcut && <div className="mt-1 pt-1 border-t border-gray-700 font-mono">{shortcut}</div>}
        </div>
      )}
    </div>
  );
};

interface CanvasControlsProps {
  onShowToast: (message: string) => void;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({ onShowToast }) => {
  const { 
    snapToGridEnabled, 
    showGuides, 
    toggleSnapToGrid, 
    toggleGuides,
    setGridSize,
    gridSize
  } = useThumbnailStore();

  // Custom toggle handlers with toast notifications
  const handleToggleSnapToGrid = () => {
    toggleSnapToGrid();
    onShowToast(snapToGridEnabled ? "Grid snapping disabled" : "Grid snapping enabled");
  };

  const handleToggleGuides = () => {
    toggleGuides();
    onShowToast(showGuides ? "Alignment guides disabled" : "Alignment guides enabled");
  };

  const handleGridSizeChange = (newSize: number) => {
    setGridSize(newSize);
    onShowToast(`Grid size set to ${newSize}px`);
  };

  return (
    <div className="flex flex-col gap-2">
      <ToggleButton
        isEnabled={snapToGridEnabled}
        onClick={handleToggleSnapToGrid}
        icon={<GridIcon />}
        label="Grid Snap"
        tooltip="Snap elements to grid when moved"
        shortcut="Ctrl+G"
      />

      <ToggleButton
        isEnabled={showGuides}
        onClick={handleToggleGuides}
        icon={<AlignIcon />}
        label="Guides"
        tooltip="Show alignment guides while dragging"
        shortcut="Ctrl+A"
      />

      {snapToGridEnabled && (
        <div className="bg-gray-200 p-2 rounded mt-1">
          <label className="block text-xs text-gray-700 mb-1">Grid Size ({gridSize}px)</label>
          <div className="flex gap-1">
            {[10, 25, 50, 100].map(size => (
              <button
                key={size}
                onClick={() => handleGridSizeChange(size)}
                className={`px-2 py-1 text-xs rounded ${
                  gridSize === size 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasControls;