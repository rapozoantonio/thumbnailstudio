// src/components/canvas/CanvasUI.tsx
import React, { useEffect, useState } from 'react';
import { Position } from '../../store/thumbnailStore';

// SVG ICONS
const KeyboardIcon = () => (
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
    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
    <line x1="6" y1="8" x2="6" y2="8"></line>
    <line x1="10" y1="8" x2="10" y2="8"></line>
    <line x1="14" y1="8" x2="14" y2="8"></line>
    <line x1="18" y1="8" x2="18" y2="8"></line>
    <line x1="6" y1="12" x2="6" y2="12"></line>
    <line x1="10" y1="12" x2="10" y2="12"></line>
    <line x1="14" y1="12" x2="14" y2="12"></line>
    <line x1="18" y1="12" x2="18" y2="12"></line>
    <line x1="6" y1="16" x2="18" y2="16"></line>
  </svg>
);

const MoveIcon = () => (
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
    <polyline points="5 9 2 12 5 15"></polyline>
    <polyline points="9 5 12 2 15 5"></polyline>
    <polyline points="15 19 12 22 9 19"></polyline>
    <polyline points="19 9 22 12 19 15"></polyline>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <line x1="12" y1="2" x2="12" y2="22"></line>
  </svg>
);

const ResizeIcon = () => (
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
    <path d="M15 3h6v6"></path>
    <path d="M9 21H3v-6"></path>
    <path d="M21 3l-7 7"></path>
    <path d="M3 21l7-7"></path>
  </svg>
);

const RotateIcon = () => (
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
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
    <path d="M3 3v5h5"></path>
  </svg>
);

// Component for a better toggle button with icon, label, and tooltip
interface ToggleButtonProps {
  isEnabled: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  shortcut?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({ isEnabled, onClick, icon, label, tooltip, shortcut }) => {
  const [showTooltip, setShowTooltip] = useState(false);

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

// Status badge that shows active features in the corner of the canvas
interface StatusBadgeProps {
  snapEnabled: boolean;
  guidesEnabled: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ snapEnabled, guidesEnabled }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`fixed left-3 bottom-3 p-2 bg-gray-700 bg-opacity-75 text-white rounded-lg shadow transition-all duration-200 ${
        expanded ? "w-auto" : "w-10 overflow-hidden"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 flex items-center justify-center bg-gray-700 rounded-full">
          <KeyboardIcon />
        </div>

        {expanded && (
          <>
            <div className={`flex items-center ml-1 gap-1 ${snapEnabled ? "text-blue-400" : "text-gray-400"}`}>
              <span className="text-xs">Grid</span>
            </div>
            <div className={`flex items-center ml-1 gap-1 ${guidesEnabled ? "text-blue-400" : "text-gray-400"}`}>
              <span className="text-xs">Guides</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Shows a notification toast when settings change
interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, visible, onHide }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fadeIn z-50">
      {message}
    </div>
  );
};

// Selection toolbar that appears near selected elements
interface SelectionToolbarProps {
  selectedId: string | null;
  selectedType: "asset" | "text" | null;
  position: Position;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onDelete?: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedId,
  selectedType,
  position,
  onBringForward,
  onSendBackward,
  onDelete,
}) => {
  if (!selectedId) return null;

  return (
    <div
      className="absolute bg-gray-700 bg-opacity-90 rounded-lg shadow-lg flex items-center p-1 z-40"
      style={{
        left: position.x,
        top: position.y - 45, // Position above the element
        transform: "translateX(-50%)",
      }}
    >
      <div className="flex gap-1">
        <button
          className="p-1.5 hover:bg-gray-600 rounded text-white flex items-center justify-center"
          title="Move (Arrow Keys)"
        >
          <MoveIcon />
        </button>

        <button
          className="p-1.5 hover:bg-gray-600 rounded text-white flex items-center justify-center"
          title="Resize (Handles)"
        >
          <ResizeIcon />
        </button>

        <button
          className="p-1.5 hover:bg-gray-600 rounded text-white flex items-center justify-center"
          title="Rotate (Corners)"
        >
          <RotateIcon />
        </button>

        {selectedType === "asset" && (
          <>
            <span className="w-px h-6 bg-gray-600 mx-1"></span>

            <button
              className="p-1.5 hover:bg-gray-600 rounded text-white flex items-center justify-center"
              title="Bring Forward"
              onClick={onBringForward}
            >
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
                <rect x="8" y="8" width="12" height="12" rx="2" ry="2"></rect>
                <path d="M4 16V4a2 2 0 0 1 2-2h12"></path>
              </svg>
            </button>

            <button
              className="p-1.5 hover:bg-gray-600 rounded text-white flex items-center justify-center"
              title="Send Backward"
              onClick={onSendBackward}
            >
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
                <rect x="4" y="4" width="12" height="12" rx="2" ry="2"></rect>
                <path d="M8 20h12a2 2 0 0 0 2-2V8"></path>
              </svg>
            </button>
          </>
        )}

        <span className="w-px h-6 bg-gray-600 mx-1"></span>

        <button
          className="p-1.5 hover:bg-red-500 rounded text-white flex items-center justify-center"
          title="Delete (Del key)"
          onClick={onDelete}
        >
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
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Component to display properties of the selected element
interface SelectionInfoProps {
  selectedId: string | null;
  selectedItem: any;
  position: Position;
}

export const SelectionInfo: React.FC<SelectionInfoProps> = ({ selectedId, selectedItem, position }) => {
  if (!selectedId || !selectedItem) return null;

  return (
    <div
      className="absolute bg-gray-700 bg-opacity-90 text-white px-3 py-2 rounded-lg shadow-lg text-xs max-w-xs z-30"
      style={{
        left: `${position.x}px`,
        top: `${position.y + 30}px`, // Position below the element
        transform: "translateX(-50%)",
      }}
    >
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {selectedItem.type && (
          <>
            <span className="text-gray-400">Type:</span>
            <span className="font-medium">{selectedItem.type}</span>
          </>
        )}

        <span className="text-gray-400">Position:</span>
        <span className="font-medium">
          X: {Math.round(selectedItem.x)}, Y: {Math.round(selectedItem.y)}
        </span>

        {selectedItem.width && selectedItem.height && (
          <>
            <span className="text-gray-400">Size:</span>
            <span className="font-medium">
              {Math.round(selectedItem.width)} × {Math.round(selectedItem.height)}
            </span>
          </>
        )}

        {selectedItem.rotation && (
          <>
            <span className="text-gray-400">Rotation:</span>
            <span className="font-medium">{Math.round(selectedItem.rotation)}°</span>
          </>
        )}
      </div>
    </div>
  );
};