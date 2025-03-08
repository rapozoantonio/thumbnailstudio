// src/components/thumbnail-canvas/hooks/useSelection.ts
import { useState, useCallback, useEffect } from 'react';
import useThumbnailStore from '../store/thumbnailStore';
import { Position } from '../types';

export const useSelection = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectionPosition, setSelectionPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"asset" | "text" | null>(null);
  const [showSelectionInfo, setShowSelectionInfo] = useState(false);
  const [selectionHint, setSelectionHint] = useState(true);
  
  // Get required state and methods from store
  const {
    text, 
    style, 
    canvasWidth,
    canvasHeight,
    bringForward, 
    sendBackward, 
    bringToFront, 
    sendToBack, 
    removeAsset, 
    updateHeadlinePosition,
    updateSubtitlePosition,
  } = useThumbnailStore();

  // Calculate headline position
  const getHeadlinePosition = useCallback(() => {
    if (text.headlineCustomPosition) {
      return text.headlineCustomPosition;
    }

    let x = canvasWidth / 2;
    let y = canvasHeight / 2;

    if (text.headlineAlignment === "left") x = 50;
    else if (text.headlineAlignment === "right") x = canvasWidth - 50;

    if (text.headlinePosition === "top") y = 100;
    else if (text.headlinePosition === "bottom") y = canvasHeight - 150;

    return { x, y };
  }, [canvasWidth, canvasHeight, text.headlineAlignment, text.headlinePosition, text.headlineCustomPosition]);

  // Calculate subtitle position
  const getSubtitlePosition = useCallback(() => {
    if (text.subtitleCustomPosition) {
      return text.subtitleCustomPosition;
    }

    const p = getHeadlinePosition();
    let x = p.x;
    let y = p.y + text.headlineSize + 20;

    if (text.subtitleAlignment === "left") x = 50;
    else if (text.subtitleAlignment === "right") x = canvasWidth - 50;

    return { x, y };
  }, [canvasWidth, getHeadlinePosition, text.headlineSize, text.subtitleAlignment, text.subtitleCustomPosition]);

  // Update selection state based on selected ID
  useEffect(() => {
    if (!selectedId) {
      setSelectedItem(null);
      setShowSelectionInfo(false);
      setSelectedType(null);
      return;
    }

    let position: Position;
    let item: any;
    let type: "asset" | "text";

    if (selectedId === "headline") {
      position = getHeadlinePosition();
      item = {
        ...text,
        x: position.x,
        y: position.y,
        width: text.headlineAlignment === "center" ? canvasWidth - 100 : 600,
        height: text.headlineSize,
      };
      type = "text";
    } else if (selectedId === "subtitle") {
      position = getSubtitlePosition();
      item = {
        ...text,
        x: position.x,
        y: position.y,
        width: text.subtitleAlignment === "center" ? canvasWidth - 100 : 600,
        height: text.subtitleSize,
      };
      type = "text";
    } else {
      const asset = style.assets.find((a) => a.id === selectedId);
      if (!asset) return;
      position = { x: asset.x + asset.width / 2, y: asset.y + asset.height / 2 };
      item = asset;
      type = "asset";
    }

    setSelectionPosition(position);
    setSelectedItem(item);
    setSelectedType(type);
    setShowSelectionInfo(true);
  }, [
    selectedId,
    text,
    style.assets,
    canvasWidth,
    getHeadlinePosition,
    getSubtitlePosition,
  ]);

  // Get element name for display
  const getElementName = useCallback((id: string | null): string => {
    if (!id) return "";
    if (id === "headline") return "Headline";
    if (id === "subtitle") return "Subtitle";

    const asset = style.assets.find((a) => a.id === id);
    return asset?.type || "Asset";
  }, [style.assets]);

  // Get element coordinates for display
  const getElementCoordinates = useCallback((): string => {
    if (!selectedItem) return "";
    return `X: ${Math.round(selectedItem.x)}, Y: ${Math.round(selectedItem.y)}`;
  }, [selectedItem]);

  // Handle selection
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setSelectionHint(false);
  }, []);

  // Handle deselection
  const handleDeselect = useCallback(() => {
    setSelectedId(null);
  }, []);

  // Handle deletion of selected element
  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return;

    if (selectedId === "headline" || selectedId === "subtitle") {
      // For text, reset position
      if (selectedId === "headline") {
        updateHeadlinePosition(null);
      } else {
        updateSubtitlePosition(null);
      }
    } else {
      // For assets, remove them
      removeAsset(selectedId);
      setSelectedId(null);
    }
  }, [selectedId, updateHeadlinePosition, updateSubtitlePosition, removeAsset]);

  // Layer ordering handlers
  const handleBringForward = useCallback(() => {
    if (selectedId && selectedType === "asset") {
      bringForward(selectedId);
    }
  }, [selectedId, selectedType, bringForward]);

  const handleSendBackward = useCallback(() => {
    if (selectedId && selectedType === "asset") {
      sendBackward(selectedId);
    }
  }, [selectedId, selectedType, sendBackward]);

  const handleBringToFront = useCallback(() => {
    if (selectedId && selectedType === "asset") {
      bringToFront(selectedId);
    }
  }, [selectedId, selectedType, bringToFront]);

  const handleSendToBack = useCallback(() => {
    if (selectedId && selectedType === "asset") {
      sendToBack(selectedId);
    }
  }, [selectedId, selectedType, sendToBack]);

  return {
    selectedId,
    selectionPosition,
    selectedItem,
    selectedType,
    showSelectionInfo,
    selectionHint,
    setSelectionHint,
    getHeadlinePosition,
    getSubtitlePosition,
    getElementName,
    getElementCoordinates,
    handleSelect,
    handleDeselect,
    handleDeleteSelected,
    handleBringForward,
    handleSendBackward,
    handleBringToFront,
    handleSendToBack,
  };
};