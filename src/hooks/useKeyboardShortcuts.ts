// src/components/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import useThumbnailStore from '../store/thumbnailStore';
import { Position } from '../types';

interface KeyboardShortcutsProps {
  selectedId: string | null;
  selectedType: "asset" | "text" | null;
  snapToGridEnabled: boolean;
  gridSize: number;
  handleToggleSnapToGrid: () => void;
  handleToggleGuides: () => void;
  handleDeleteSelected: () => void;
  handleBringForward: () => void;
  handleSendBackward: () => void;
}

export const useKeyboardShortcuts = ({
  selectedId,
  selectedType,
  snapToGridEnabled,
  gridSize,
  handleToggleSnapToGrid,
  handleToggleGuides,
  handleDeleteSelected,
  handleBringForward,
  handleSendBackward,
}: KeyboardShortcutsProps) => {
  const {
    updateAsset,
    updateHeadlinePosition,
    updateSubtitlePosition,
    style,
    getHeadlinePosition,
    getSubtitlePosition,
  } = useThumbnailStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when editing text inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle feature toggles
      if (e.key === "g" && e.ctrlKey) {
        e.preventDefault();
        handleToggleSnapToGrid();
        return;
      }

      if (e.key === "a" && e.ctrlKey) {
        e.preventDefault();
        handleToggleGuides();
        return;
      }

      // Ignore if no element is selected
      if (!selectedId) return;

      // Handle deletion
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDeleteSelected();
        return;
      }

      // Layer ordering
      if (e.key === "[" && e.ctrlKey && selectedType === "asset") {
        e.preventDefault();
        handleSendBackward();
        return;
      }

      if (e.key === "]" && e.ctrlKey && selectedType === "asset") {
        e.preventDefault();
        handleBringForward();
        return;
      }

      // Handle movement keys
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;

      // Prevent page scrolling
      e.preventDefault();

      const moveIncrement = snapToGridEnabled ? gridSize : e.shiftKey ? 10 : 1;
      let deltaX = 0;
      let deltaY = 0;

      switch (e.key) {
        case "ArrowUp":
          deltaY = -moveIncrement;
          break;
        case "ArrowDown":
          deltaY = moveIncrement;
          break;
        case "ArrowLeft":
          deltaX = -moveIncrement;
          break;
        case "ArrowRight":
          deltaX = moveIncrement;
          break;
      }

      if (selectedId === "headline") {
        const currentPos = getHeadlinePosition();
        updateHeadlinePosition({
          x: currentPos.x + deltaX,
          y: currentPos.y + deltaY,
        });
      } else if (selectedId === "subtitle") {
        const currentPos = getSubtitlePosition();
        updateSubtitlePosition({
          x: currentPos.x + deltaX,
          y: currentPos.y + deltaY,
        });
      } else {
        // Find the asset and update its position
        const asset = style.assets.find((a) => a.id === selectedId);
        if (asset) {
          updateAsset(selectedId, {
            x: asset.x + deltaX,
            y: asset.y + deltaY,
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedId,
    selectedType,
    snapToGridEnabled,
    gridSize,
    style.assets,
    updateAsset,
    updateHeadlinePosition,
    updateSubtitlePosition,
    getHeadlinePosition,
    getSubtitlePosition,
    handleToggleSnapToGrid,
    handleToggleGuides,
    handleDeleteSelected,
    handleBringForward,
    handleSendBackward,
  ]);
};