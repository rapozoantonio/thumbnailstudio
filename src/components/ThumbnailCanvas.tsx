// src/components/ThumbnailCanvas.tsx
import React, { useRef, useState, useMemo, useCallback } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";
import { Box, Snackbar, Alert, Zoom } from "@mui/material";

// Store
import useThumbnailStore from "../store/thumbnailStore";

// Custom hooks
import { useSelection } from "../hooks/useSelection";
import { useToasts } from "../hooks/useToasts";
import { useGuides } from "../hooks/useGuides";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useCanvasScaling } from "../hooks/useCanvasScaling";

// Components
import { AlignmentGuides } from "./canvas/AlignmentGuides";
import { BackgroundImage } from "./canvas/BackgroundImage";
import { ControlPanel } from "./canvas/ControlPanel";
import { StatusChip, BackgroundIndicator } from "./canvas/StatusIndicators";
import { SelectionOverlay } from "./canvas/SelectionOverlay";
import { KeyboardShortcuts } from "./canvas/KeyboardShortcuts";
import { SelectionHint } from "./canvas/SelectionHint";
import DraggableAsset from "./canvas/DraggableAsset";
import DraggableText from "./canvas/DraggableText";

// Utils
import { renderGrid, snapToGrid } from "../utils/grid";
import { getBackgroundFill } from "../utils/styling";

/**
 * Main ThumbnailCanvas Component
 * Handles the canvas for creating and editing thumbnails
 */
export default function ThumbnailCanvas() {
  // Refs
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local state
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragShape, setCurrentDragShape] = useState<any>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Get state from store
  const {
    canvasWidth,
    canvasHeight,
    style,
    text,
    gridSize,
    snapToGridEnabled,
    showGuides,
    updateText,
    updateAsset,
    updateHeadlinePosition,
    updateSubtitlePosition,
    saveToHistory,
    setStageRef,
    toggleSnapToGrid,
    toggleGuides,
    removeBackground,
  } = useThumbnailStore();

  // Custom hooks
  const { toast, showToast, hideToast } = useToasts();
  
  // Define callbacks before they're used in hooks
  const handleToggleSnapToGrid = useCallback(() => {
    toggleSnapToGrid();
    showToast(snapToGridEnabled ? "Grid snapping disabled" : "Grid snapping enabled");
  }, [toggleSnapToGrid, showToast, snapToGridEnabled]);

  const handleToggleGuides = useCallback(() => {
    toggleGuides();
    showToast(showGuides ? "Alignment guides disabled" : "Alignment guides enabled");
  }, [toggleGuides, showToast, showGuides]);

  const {
    selectedId,
    selectionPosition,
    selectedItem,
    selectedType,
    showSelectionInfo,
    selectionHint,
    setSelectionHint,
    handleSelect,
    handleDeselect,
    handleDeleteSelected,
    handleBringForward,
    handleSendBackward,
    handleBringToFront,
    handleSendToBack,
    getElementName,
    getElementCoordinates,
  } = useSelection();

  // Calculate positions for headline
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

  // Calculate positions for subtitle
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

  // Calculate positions
  const headlinePos = getHeadlinePosition();
  const subtitlePos = getSubtitlePosition();

  // Get all shapes for alignment guides
  const getAllShapes = useCallback(() => {
    const shapes = [];
    
    // Add headline
    shapes.push({
      id: "headline",
      x: headlinePos.x,
      y: headlinePos.y,
      width: text.headlineAlignment === "center" ? canvasWidth - 100 : 600,
      height: text.headlineSize,
    });

    // Add subtitle
    shapes.push({
      id: "subtitle",
      x: subtitlePos.x,
      y: subtitlePos.y,
      width: text.subtitleAlignment === "center" ? canvasWidth - 100 : 600,
      height: text.subtitleSize,
    });

    // Add assets (excluding background)
    if (style.assets) {
      style.assets
        .filter((asset) => !asset.isBackground)
        .forEach((asset) => {
          shapes.push({
            id: asset.id,
            x: asset.x,
            y: asset.y,
            width: asset.width,
            height: asset.height,
          });
        });
    }

    return shapes;
  }, [headlinePos, subtitlePos, text.headlineAlignment, text.subtitleAlignment, canvasWidth, text.headlineSize, text.subtitleSize, style.assets]);

  const { activeGuides, generateGuidesForDrag } = useGuides(getAllShapes);
  
  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    selectedId,
    selectedType,
    snapToGridEnabled,
    gridSize,
    handleToggleSnapToGrid,
    handleToggleGuides,
    handleDeleteSelected,
    handleBringForward,
    handleSendBackward,
  });
  
  // Handle canvas scaling
  useCanvasScaling(containerRef, stageRef, canvasWidth, canvasHeight);

  // Find background asset if any
  const backgroundAsset = useMemo(() => 
    style.assets?.find((asset) => asset.isBackground === true)
  , [style.assets]);

  const handleRemoveBackground = useCallback(() => {
    if (backgroundAsset) {
      removeBackground();
      showToast("Background removed", "success");
    }
  }, [backgroundAsset, removeBackground, showToast]);

  // Save stageRef to store
  React.useEffect(() => {
    if (stageRef.current) {
      setStageRef({ current: stageRef.current });
    }
  }, [stageRef, setStageRef]);

  // Toggle shortcuts panel
  const handleToggleShortcuts = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setShowShortcuts(!showShortcuts);
  }, [anchorEl, showShortcuts]);

  // Handle click away for shortcuts panel
  const handleClickAway = useCallback(() => {
    setShowShortcuts(false);
    setAnchorEl(null);
  }, []);

  // Drag event handlers
  const handleDragStart = useCallback((id: string, item: any) => {
    setIsDragging(true);
    setCurrentDragShape(item);
    saveToHistory(); // Save state before drag for undo/redo
  }, [saveToHistory]);

  const handleDragMove = useCallback((id: string, item: any) => {
    if (!showGuides) return;

    setCurrentDragShape(item);
    generateGuidesForDrag(id, item);
  }, [showGuides, generateGuidesForDrag]);

  const handleDragEnd = useCallback((id: string, item: any) => {
    setIsDragging(false);
    setCurrentDragShape(null);

    // Update state based on the type of element
    if (id === "headline") {
      updateHeadlinePosition({
        x: item.x,
        y: item.y,
      });
      showToast(`Headline positioned at X: ${Math.round(item.x)}, Y: ${Math.round(item.y)}`);
    } else if (id === "subtitle") {
      updateSubtitlePosition({
        x: item.x,
        y: item.y,
      });
      showToast(`Subtitle positioned at X: ${Math.round(item.x)}, Y: ${Math.round(item.y)}`);
    } else {
      // Update asset position
      updateAsset(id, {
        x: item.x,
        y: item.y,
      });
      showToast(`Asset positioned at X: ${Math.round(item.x)}, Y: ${Math.round(item.y)}`);
    }
  }, [updateHeadlinePosition, updateSubtitlePosition, updateAsset, showToast]);

  // Handle text properties change
  const handleTextChange = useCallback((id: string, updates: any) => {
    if (id === "headline") {
      if (updates.fontSize !== text.headlineSize) {
        updateText({ headlineSize: updates.fontSize });
      }
      updateHeadlinePosition({ x: updates.x, y: updates.y });
    } else if (id === "subtitle") {
      if (updates.fontSize !== text.subtitleSize) {
        updateText({ subtitleSize: updates.fontSize });
      }
      updateSubtitlePosition({ x: updates.x, y: updates.y });
    }
  }, [text.headlineSize, text.subtitleSize, updateText, updateHeadlinePosition, updateSubtitlePosition]);

  // Sort assets by zIndex (excluding background)
  const sortedAssets = useMemo(() => 
    [...style.assets]
      .filter((asset) => !asset.isBackground)
      .sort((a, b) => a.zIndex - b.zIndex)
  , [style.assets]);

  // Text values with fallbacks
  const headlineText = text.headline || "Your Headline";
  const subtitleText = text.subtitle || "Your Subtitle";

  return (
    <Box className="relative w-full h-full" sx={{ userSelect: "none" }}>
      <Box ref={containerRef} className="w-full h-full flex items-center justify-center relative">
        {/* Control Panel */}
        <ControlPanel 
          snapToGridEnabled={snapToGridEnabled}
          showGuides={showGuides}
          onToggleSnapToGrid={handleToggleSnapToGrid}
          onToggleGuides={handleToggleGuides}
        />

        {/* Status Indicator */}
        <StatusChip 
          snapToGridEnabled={snapToGridEnabled}
          showGuides={showGuides}
        />

        {/* Background Indicator */}
        {backgroundAsset && (
          <BackgroundIndicator 
            onRemoveBackground={handleRemoveBackground}
          />
        )}

        {/* Selection hint for new users */}
        {selectionHint && !selectedId && style.assets.length > 0 && (
          <SelectionHint onDismiss={() => setSelectionHint(false)} />
        )}

        {/* Toast Notifications */}
        <Snackbar
          open={toast.visible}
          autoHideDuration={3000}
          onClose={hideToast}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert 
            onClose={hideToast} 
            severity={toast.severity} 
            variant="filled" 
            elevation={6} 
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
        </Snackbar>

        {/* Selection Toolbar */}
        {selectedId && showSelectionInfo && !isDragging && (
          <SelectionOverlay
            x={Math.max(10, Math.min(selectionPosition.x - 100, canvasWidth - 200))}
            y={selectionPosition.y < canvasHeight / 2 ? selectionPosition.y + 30 : selectionPosition.y - 70}
            name={getElementName(selectedId)}
            coordinates={getElementCoordinates()}
            type={selectedType}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
            onDelete={handleDeleteSelected}
          />
        )}

        {/* Canvas */}
        <Stage ref={stageRef} width={canvasWidth} height={canvasHeight}>
          <Layer>
            {/* Base Background (Color or Gradient) */}
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleDeselect}
              onTap={handleDeselect}
              {...(style.backgroundGradient?.enabled && 
                getBackgroundFill(style.backgroundGradient, canvasWidth, canvasHeight))}
              fill={style.backgroundColor}
              stroke="#fff"
              strokeWidth={3}
              listening={true}
            />

            {/* Background Image */}
            {backgroundAsset && (
              <BackgroundImage 
                asset={backgroundAsset} 
                canvasWidth={canvasWidth} 
                canvasHeight={canvasHeight} 
              />
            )}

            {/* Grid */}
            {renderGrid(canvasWidth, canvasHeight, gridSize, snapToGridEnabled).map(line => (
              <Line 
                key={line.key}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                opacity={line.opacity}
              />
            ))}

            {/* Alignment guides */}
            {isDragging && showGuides && (
              <AlignmentGuides 
                guides={activeGuides} 
                canvasWidth={canvasWidth} 
                canvasHeight={canvasHeight} 
              />
            )}

            {/* Draggable assets */}
            {sortedAssets.map((asset) => (
              <DraggableAsset
                key={asset.id}
                asset={asset}
                isSelected={selectedId === asset.id}
                onSelect={handleSelect}
                onChange={(updated) => updateAsset(updated.id, updated)}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                snapToGridEnabled={snapToGridEnabled}
                gridSize={gridSize}
              />
            ))}

            {/* Draggable Headline */}
            <DraggableText
              id="headline"
              text={headlineText}
              x={headlinePos.x}
              y={headlinePos.y}
              fontSize={text.headlineSize}
              width={text.headlineAlignment === "center" ? canvasWidth - 100 : 600}
              align={text.headlineAlignment}
              isSelected={selectedId === "headline"}
              textSettings={text}
              styleSettings={style}
              onSelect={handleSelect}
              onChange={handleTextChange}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              snapToGridEnabled={snapToGridEnabled}
              gridSize={gridSize}
            />

            {/* Draggable Subtitle */}
            <DraggableText
              id="subtitle"
              text={subtitleText}
              x={subtitlePos.x}
              y={subtitlePos.y}
              fontSize={text.subtitleSize}
              width={text.subtitleAlignment === "center" ? canvasWidth - 100 : 600}
              align={text.subtitleAlignment}
              isSelected={selectedId === "subtitle"}
              textSettings={text}
              styleSettings={style}
              onSelect={handleSelect}
              onChange={handleTextChange}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              snapToGridEnabled={snapToGridEnabled}
              gridSize={gridSize}
            />
          </Layer>
        </Stage>

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts 
          open={showShortcuts}
          anchorEl={anchorEl}
          onToggle={handleToggleShortcuts}
          onClose={handleClickAway}
        />
      </Box>
    </Box>
  );
}