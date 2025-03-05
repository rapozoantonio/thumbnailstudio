// src/components/ThumbnailCanvas.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Rect, Text, Line, Group } from "react-konva";
import {
  Box,
  Paper,
  Tooltip,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Zoom,
  Fade,
  Typography,
  Popper,
  Card,
  CardContent,
  ClickAwayListener,
  Divider,
} from "@mui/material";
import {
  GridOn,
  GridOff,
  Straighten,
  KeyboardArrowUp,
  KeyboardArrowDown,
  DeleteOutline,
  Keyboard,
  InfoOutlined,
  Close,
  ArrowUpward,
  ArrowDownward,
  VerticalAlignTop,
  VerticalAlignBottom,
} from "@mui/icons-material";

import useThumbnailStore from "../store/thumbnailStore";
import { Asset, Position } from "../store/thumbnailStore";
import DraggableAsset from "./canvas/DraggableAsset.tsx";
import DraggableText from "./canvas/DraggableText.tsx";
import CanvasControls from "./canvas/CanvasControls.tsx";
import { createTextProps } from "../utils/textStyler.ts";
import { styled } from "@mui/material/styles";

/**
 * Helper function to snap position to grid
 */
const snapToGrid = (position: Position, gridSize: number): Position => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
};

/**
 * Renders a grid for visual alignment with opacity based on snap status
 */
const renderGrid = (width: number, height: number, cellSize: number = 50, snapEnabled: boolean = false) => {
  const lines = [];
  // Grid is more visible when snap is enabled
  const opacity = snapEnabled ? 0.3 : 0.15;
  const strokeColor = snapEnabled ? "#2196F3" : "#ffffff";

  // Vertical lines
  for (let x = 0; x <= width; x += cellSize) {
    lines.push(<Line key={`v-${x}`} points={[x, 0, x, height]} stroke={strokeColor} strokeWidth={0.5} opacity={opacity} />);
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += cellSize) {
    lines.push(<Line key={`h-${y}`} points={[0, y, width, y]} stroke={strokeColor} strokeWidth={0.5} opacity={opacity} />);
  }

  return lines;
};

interface Guide {
  position: number;
  isHorizontal: boolean;
  diff: number;
}

/**
 * Generates alignment guides for snapping
 */
const generateGuides = (currentShape: any, allShapes: any[], tolerance: number = 5): Guide[] => {
  if (!currentShape) return [];

  const guides: Guide[] = [];
  const currentBounds = {
    left: currentShape.x,
    right: currentShape.x + (currentShape.width || 0),
    top: currentShape.y,
    bottom: currentShape.y + (currentShape.height || 0),
    centerX: currentShape.x + (currentShape.width || 0) / 2,
    centerY: currentShape.y + (currentShape.height || 0) / 2,
  };

  // Helper to add a guide line if it's within tolerance
  const addGuideIfClose = (value: number, target: number, isHorizontal: boolean): boolean => {
    const diff = Math.abs(value - target);
    if (diff < tolerance) {
      guides.push({
        position: target,
        isHorizontal,
        diff,
      });
      return true;
    }
    return false;
  };

  allShapes.forEach((shape) => {
    if (shape.id === currentShape.id) return;

    const bounds = {
      left: shape.x,
      right: shape.x + (shape.width || 0),
      top: shape.y,
      bottom: shape.y + (shape.height || 0),
      centerX: shape.x + (shape.width || 0) / 2,
      centerY: shape.y + (shape.height || 0) / 2,
    };

    // Vertical alignment (left, center, right)
    addGuideIfClose(currentBounds.left, bounds.left, false);
    addGuideIfClose(currentBounds.centerX, bounds.centerX, false);
    addGuideIfClose(currentBounds.right, bounds.right, false);

    // Horizontal alignment (top, middle, bottom)
    addGuideIfClose(currentBounds.top, bounds.top, true);
    addGuideIfClose(currentBounds.centerY, bounds.centerY, true);
    addGuideIfClose(currentBounds.bottom, bounds.bottom, true);
  });

  // Sort guides by closeness to enable snapping to the closest guide
  return guides.sort((a, b) => a.diff - b.diff);
};

/**
 * Renders alignment guides when dragging
 */
const AlignmentGuides: React.FC<{
  guides: Guide[];
  canvasWidth: number;
  canvasHeight: number;
}> = ({ guides, canvasWidth, canvasHeight }) => {
  return (
    <>
      {guides.map((guide, i) => {
        const points = guide.isHorizontal
          ? [0, guide.position, canvasWidth, guide.position]
          : [guide.position, 0, guide.position, canvasHeight];
        return <Line key={i} points={points} stroke="#2196F3" strokeWidth={1} dash={[5, 5]} />;
      })}
    </>
  );
};

// Styled components for UI elements
const ControlPanel = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  padding: theme.spacing(1),
  zIndex: 10,
  backgroundColor: "rgba(38, 50, 56, 0.9)",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  left: theme.spacing(1),
  top: theme.spacing(1),
  zIndex: 10,
  backgroundColor: "rgba(38, 50, 56, 0.85)",
}));

const SelectionOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  zIndex: 5,
  padding: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  backgroundColor: "rgba(33, 150, 243, 0.15)",
  backdropFilter: "blur(4px)",
  borderRadius: theme.shape.borderRadius,
}));

const ShortcutsButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  zIndex: 10,
  backgroundColor: "rgba(38, 50, 56, 0.85)",
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: "rgba(38, 50, 56, 0.95)",
  },
}));

const HelpTooltip = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "rgba(38, 50, 56, 0.9)",
  color: theme.palette.common.white,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  maxWidth: 320,
  zIndex: 20,
  textAlign: "center",
  boxShadow: theme.shadows[10],
}));

const ShortcutsCard = styled(Card)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(6),
  bottom: theme.spacing(6),
  zIndex: 100,
  maxWidth: 320,
  backgroundColor: "rgba(38, 50, 56, 0.95)",
  color: theme.palette.common.white,
  boxShadow: theme.shadows[8],
}));

const KeyboardShortcut = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: theme.spacing(0.5, 0),
}));

const KeyCombination = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
}));

const KeyCapBadge = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.25, 0.75),
  fontSize: "0.75rem",
  fontWeight: "bold",
  minWidth: 20,
  textAlign: "center",
}));

/**
 * Main ThumbnailCanvas Component with enhanced text styling support
 */
export default function ThumbnailCanvas() {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Pull all the state we need from Zustand store
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
    bringForward,
    sendBackward,
    removeAsset,
    bringToFront,
    sendToBack,
  } = useThumbnailStore();

  // Local state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeGuides, setActiveGuides] = useState<Guide[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragShape, setCurrentDragShape] = useState<any>(null);
  const [selectionPosition, setSelectionPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"asset" | "text" | null>(null);
  const [showSelectionInfo, setShowSelectionInfo] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    visible: false,
    severity: "info" as "success" | "info" | "warning" | "error",
  });
  const [selectionHint, setSelectionHint] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Helper for showing toasts
  const showToast = (message: string, severity: "success" | "info" | "warning" | "error" = "info") => {
    setToast({ message, visible: true, severity });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Custom toggle handlers with toast notifications
  const handleToggleSnapToGrid = () => {
    toggleSnapToGrid();
    showToast(snapToGridEnabled ? "Grid snapping disabled" : "Grid snapping enabled");
  };

  const handleToggleGuides = () => {
    toggleGuides();
    showToast(showGuides ? "Alignment guides disabled" : "Alignment guides enabled");
  };

  // Calculate positions for headline
  const getHeadlinePosition = useCallback((): Position => {
    // First check if there's a custom position stored
    if (text.headlineCustomPosition) {
      return text.headlineCustomPosition;
    }

    // Otherwise calculate based on alignment settings
    let x = canvasWidth / 2;
    let y = canvasHeight / 2;

    if (text.headlineAlignment === "left") x = 50;
    else if (text.headlineAlignment === "right") x = canvasWidth - 50;

    if (text.headlinePosition === "top") y = 100;
    else if (text.headlinePosition === "bottom") y = canvasHeight - 150;

    return { x, y };
  }, [canvasWidth, canvasHeight, text.headlineAlignment, text.headlinePosition, text.headlineCustomPosition]);

  const headlinePos = getHeadlinePosition();

  // Calculate positions for subtitle
  const getSubtitlePosition = useCallback((): Position => {
    // First check if there's a custom position stored
    if (text.subtitleCustomPosition) {
      return text.subtitleCustomPosition;
    }

    // Otherwise position relative to headline
    const p = getHeadlinePosition();
    let x = p.x;
    let y = p.y + text.headlineSize + 20;

    if (text.subtitleAlignment === "left") x = 50;
    else if (text.subtitleAlignment === "right") x = canvasWidth - 50;

    return { x, y };
  }, [canvasWidth, getHeadlinePosition, text.headlineSize, text.subtitleAlignment, text.subtitleCustomPosition]);

  const subtitlePos = getSubtitlePosition();

  // Text fallback
  const headlineText = text.headline || "Your Headline";
  const subtitleText = text.subtitle || "Your Subtitle";

  // Save stageRef to store
  useEffect(() => {
    if (stageRef.current) {
      setStageRef({ current: stageRef.current });
    }
  }, [stageRef, setStageRef]);

  // Collect all objects for alignment guides
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

    // Add assets
    if (style.assets) {
      style.assets.forEach((asset) => {
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
  }, [
    headlinePos,
    subtitlePos,
    text.headlineAlignment,
    text.subtitleAlignment,
    text.headlineSize,
    text.subtitleSize,
    style.assets,
    canvasWidth,
  ]);

  // Update selection position and info when selection changes
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
    text.headlineAlignment,
    text.subtitleAlignment,
    text.headlineSize,
    text.subtitleSize,
    canvasWidth,
    getHeadlinePosition,
    getSubtitlePosition,
  ]);

  // Scale the stage to fit the container
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !stageRef.current) return;

      const container = containerRef.current;
      const stage = stageRef.current.getStage();

      const aspectRatio = canvasWidth / canvasHeight;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      let scale;
      if (containerWidth / containerHeight > aspectRatio) {
        scale = containerHeight / canvasHeight;
      } else {
        scale = containerWidth / canvasWidth;
      }

      stage.width(canvasWidth * scale);
      stage.height(canvasHeight * scale);
      stage.scale({ x: scale, y: scale });
      stage.draw();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasWidth, canvasHeight]);

  // Keyboard shortcuts handling
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
        showToast(`Headline: X ${Math.round(currentPos.x + deltaX)}, Y ${Math.round(currentPos.y + deltaY)}`);
      } else if (selectedId === "subtitle") {
        const currentPos = getSubtitlePosition();
        updateSubtitlePosition({
          x: currentPos.x + deltaX,
          y: currentPos.y + deltaY,
        });
        showToast(`Subtitle: X ${Math.round(currentPos.x + deltaX)}, Y ${Math.round(currentPos.y + deltaY)}`);
      } else {
        // Find the asset and update its position
        const asset = style.assets.find((a) => a.id === selectedId);
        if (asset) {
          const newX = asset.x + deltaX;
          const newY = asset.y + deltaY;
          updateAsset(selectedId, {
            x: newX,
            y: newY,
          });
          showToast(`${asset.type || "Asset"}: X ${Math.round(newX)}, Y ${Math.round(newY)}`);
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
  ]);

  // Handle bring forward
  const handleBringForward = () => {
    if (selectedId && selectedType === "asset") {
      bringForward(selectedId);
      showToast("Moved element forward", "success");
    }
  };

  // Handle send backward
  const handleSendBackward = () => {
    if (selectedId && selectedType === "asset") {
      sendBackward(selectedId);
      showToast("Moved element backward", "success");
    }
  };

  // Handle bring to front
  const handleBringToFront = () => {
    if (selectedId && selectedType === "asset") {
      bringToFront(selectedId);
      showToast("Moved element to front", "success");
    }
  };

  // Handle send to back
  const handleSendToBack = () => {
    if (selectedId && selectedType === "asset") {
      sendToBack(selectedId);
      showToast("Moved element to back", "success");
    }
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (!selectedId) return;

    if (selectedId === "headline" || selectedId === "subtitle") {
      // For text, we can't delete it but we can reset its position
      if (selectedId === "headline") {
        updateHeadlinePosition(null);
        showToast("Reset headline position", "success");
      } else {
        updateSubtitlePosition(null);
        showToast("Reset subtitle position", "success");
      }
    } else {
      // For assets, we can actually remove them
      removeAsset(selectedId);
      setSelectedId(null);
      showToast("Element deleted", "success");
    }
  };

  // Clicking the background => deselect everything
  const handleBackgroundClick = () => {
    setSelectedId(null);
    setActiveGuides([]);
  };

  // Convert style's gradient or fallback to a color
  const getBackgroundFill = () => {
    if (!style.backgroundGradient?.enabled) {
      return style.backgroundColor;
    }

    return {
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: {
        x: style.backgroundGradient.type === "linear" ? canvasWidth : canvasWidth / 2,
        y: style.backgroundGradient.type === "linear" ? canvasHeight : canvasHeight / 2,
      },
      fillLinearGradientColorStops: [0, style.backgroundGradient.colors[0], 1, style.backgroundGradient.colors[1]],
    };
  };

  // Handle selection
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSelectionHint(false); // Hide the selection hint once user has selected something
    showToast("Use handles to resize or arrow keys to move");
  };

  // Handle drag start
  const handleDragStart = (id: string, item: any) => {
    setIsDragging(true);
    setCurrentDragShape(item);
    saveToHistory(); // Save state before drag for undo/redo
  };

  // Handle drag move (for alignment guides)
  const handleDragMove = (id: string, item: any) => {
    if (!showGuides) return;

    setCurrentDragShape(item);

    // Generate guides based on all other shapes
    const allShapes = getAllShapes();
    const guides = generateGuides(
      item,
      allShapes.filter((shape) => shape.id !== id)
    );

    setActiveGuides(guides.slice(0, 4)); // Show only the closest guides

    // Update position for selection UI
    setSelectionPosition({
      x: item.x + (item.width ? item.width / 2 : 0),
      y: item.y + (item.height ? item.height / 2 : 0),
    });

    // Update selected item
    setSelectedItem(item);
  };

  // Handle drag end
  const handleDragEnd = (id: string, item: any) => {
    setIsDragging(false);
    setActiveGuides([]);
    setCurrentDragShape(null);

    // Apply grid snapping if enabled
    let finalPosition = { x: item.x, y: item.y };
    if (snapToGridEnabled) {
      finalPosition = snapToGrid(finalPosition, gridSize);
    }

    // Update state based on the type of element
    if (id === "headline") {
      updateHeadlinePosition(finalPosition);
      showToast(`Headline positioned at X: ${Math.round(finalPosition.x)}, Y: ${Math.round(finalPosition.y)}`);
    } else if (id === "subtitle") {
      updateSubtitlePosition(finalPosition);
      showToast(`Subtitle positioned at X: ${Math.round(finalPosition.x)}, Y: ${Math.round(finalPosition.y)}`);
    } else {
      // Update asset position
      updateAsset(id, finalPosition);
      showToast(`Asset positioned at X: ${Math.round(finalPosition.x)}, Y: ${Math.round(finalPosition.y)}`);
    }
  };

  // Handle text properties change
  const handleTextChange = (id: string, updates: any) => {
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
  };

  // Toggle shortcuts panel
  const handleToggleShortcuts = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setShowShortcuts(!showShortcuts);
  };

  // Handle click away for shortcuts panel
  const handleClickAway = () => {
    setShowShortcuts(false);
    setAnchorEl(null);
  };

  // Sort assets by zIndex to ensure proper rendering order
  const sortedAssets = [...style.assets].sort((a, b) => a.zIndex - b.zIndex);

  // Get element name for display
  const getElementName = (id: string | null): string => {
    if (!id) return "";
    if (id === "headline") return "Headline";
    if (id === "subtitle") return "Subtitle";

    const asset = style.assets.find((a) => a.id === id);
    return asset?.type || "Asset";
  };

  // Get element coordinates for display
  const getElementCoordinates = (): string => {
    if (!selectedItem) return "";
    return `X: ${Math.round(selectedItem.x)}, Y: ${Math.round(selectedItem.y)}`;
  };

  return (
    <Box className="relative w-full h-full" sx={{ userSelect: "none" }}>
      {/* Main container */}
      <Box ref={containerRef} className="w-full h-full flex items-center justify-center relative">
        {/* Material UI Control Panel */}
        <ControlPanel elevation={3}>
          <Tooltip title="Toggle grid snapping (Ctrl+G)" placement="left">
            <IconButton size="small" color={snapToGridEnabled ? "primary" : "default"} onClick={handleToggleSnapToGrid}>
              {snapToGridEnabled ? <GridOn /> : <GridOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle alignment guides (Ctrl+A)" placement="left">
            <IconButton size="small" color={showGuides ? "primary" : "default"} onClick={handleToggleGuides}>
              <Straighten />
            </IconButton>
          </Tooltip>
        </ControlPanel>

        {/* Status Indicator */}
        <StatusChip
          size="small"
          variant="filled"
          color={snapToGridEnabled || showGuides ? "primary" : "default"}
          label={
            snapToGridEnabled && showGuides
              ? "Grid & Guides On"
              : snapToGridEnabled
              ? "Grid On"
              : showGuides
              ? "Guides On"
              : "No Helpers"
          }
          icon={
            snapToGridEnabled ? (
              <GridOn fontSize="small" />
            ) : showGuides ? (
              <Straighten fontSize="small" />
            ) : (
              <InfoOutlined fontSize="small" />
            )
          }
        />

        {/* Selection hint for new users */}
        <Fade in={selectionHint && !selectedId && style.assets.length > 0}>
          <HelpTooltip>
            <Typography variant="subtitle1" fontWeight="medium">
              Click any element to select and edit it
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              Use arrow keys for precise movement
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Tooltip title="Dismiss">
                <IconButton size="small" sx={{ color: "white" }} onClick={() => setSelectionHint(false)}>
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </HelpTooltip>
        </Fade>

        {/* Material UI Toast Notifications */}
        <Snackbar
          open={toast.visible}
          autoHideDuration={3000}
          onClose={hideToast}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={hideToast} severity={toast.severity} variant="filled" elevation={6} sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        </Snackbar>

        {/* Selection Toolbar - only shown when something is selected */}
        {selectedId && showSelectionInfo && !isDragging && (
          <Zoom in={true}>
            <SelectionOverlay
              sx={{
                top: selectionPosition.y < canvasHeight / 2 ? selectionPosition.y + 30 : selectionPosition.y - 70,
                left: Math.max(10, Math.min(selectionPosition.x - 100, canvasWidth - 200)),
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: "medium", mr: 1 }}>
                {getElementName(selectedId)} {getElementCoordinates()}
              </Typography>

              {selectedType === "asset" && (
                <>
                  <Tooltip title="Bring Forward (Ctrl+])">
                    <IconButton size="small" onClick={handleBringForward}>
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send Backward (Ctrl+[)">
                    <IconButton size="small" onClick={handleSendBackward}>
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bring to Front">
                    <IconButton size="small" onClick={handleBringToFront}>
                      <VerticalAlignTop fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send to Back">
                    <IconButton size="small" onClick={handleSendToBack}>
                      <VerticalAlignBottom fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Tooltip title={selectedType === "text" ? "Reset Position" : "Delete (Del)"}>
                <IconButton size="small" onClick={handleDeleteSelected}>
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            </SelectionOverlay>
          </Zoom>
        )}

        {/* The Canvas */}
        <Stage ref={stageRef} width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleBackgroundClick}
              onTap={handleBackgroundClick}
              {...(style.backgroundGradient?.enabled && getBackgroundFill())}
              fill={style.backgroundColor}
              stroke="#fff"
              strokeWidth={3}
              listening={false}
            />

            {/* Grid for orientation - more visible when snap is enabled */}
            {renderGrid(canvasWidth, canvasHeight, gridSize, snapToGridEnabled)}

            {/* Alignment guides (only shown during dragging) */}
            {isDragging && showGuides && (
              <AlignmentGuides guides={activeGuides} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
            )}

            {/* Draggable assets sorted by zIndex */}
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
              />
            ))}

            {/* Badge styling if enabled */}
            {style.badgeStyle && style.badgeStyle !== "none" && (
              <>
                <Rect
                  x={style.badgeStyle === "pill" || style.badgeStyle === "rectangle" ? canvasWidth - 150 : 30}
                  y={style.badgeStyle === "floating" || style.badgeStyle === "code" ? canvasHeight - 70 : 30}
                  width={100}
                  height={40}
                  fill={
                    style.badgeStyle === "pill"
                      ? "#2563EB"
                      : style.badgeStyle === "rectangle"
                      ? "#EF4444"
                      : style.badgeStyle === "code"
                      ? "#1F2937"
                      : style.badgeStyle === "floating"
                      ? "#4F46E5"
                      : "#374151"
                  }
                  cornerRadius={
                    style.badgeStyle === "pill"
                      ? 20
                      : style.badgeStyle === "rectangle"
                      ? 5
                      : style.badgeStyle === "code"
                      ? 3
                      : style.badgeStyle === "floating"
                      ? 8
                      : 0
                  }
                  opacity={0.9}
                />
                <Text
                  text="CODE"
                  x={style.badgeStyle === "pill" || style.badgeStyle === "rectangle" ? canvasWidth - 150 : 30}
                  y={style.badgeStyle === "floating" || style.badgeStyle === "code" ? canvasHeight - 70 : 30}
                  width={100}
                  height={40}
                  fontSize={16}
                  fontFamily={style.badgeStyle === "code" ? "Courier New" : style.fontFamily}
                  fill="#FFFFFF"
                  align="center"
                  verticalAlign="middle"
                />
              </>
            )}

            {/* Draggable Headline with enhanced styling */}
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
            />

            {/* Draggable Subtitle with enhanced styling */}
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
            />
          </Layer>
        </Stage>

        {/* Keyboard Shortcuts Button */}
        <Tooltip title="Keyboard Shortcuts">
          <ShortcutsButton size="small" onClick={handleToggleShortcuts}>
            <Keyboard />
          </ShortcutsButton>
        </Tooltip>

        {/* Keyboard Shortcuts Panel */}
        <Popper open={showShortcuts} anchorEl={anchorEl} placement="top-end" transition>
          {({ TransitionProps }) => (
            <ClickAwayListener onClickAway={handleClickAway}>
              <Fade {...TransitionProps} timeout={350}>
                <ShortcutsCard>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: "medium", mb: 1 }}>
                      Keyboard Shortcuts
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <KeyboardShortcut>
                      <Typography variant="body2">Move selection</Typography>
                      <KeyCombination>
                        <KeyCapBadge>↑</KeyCapBadge>
                        <KeyCapBadge>↓</KeyCapBadge>
                        <KeyCapBadge>←</KeyCapBadge>
                        <KeyCapBadge>→</KeyCapBadge>
                      </KeyCombination>
                    </KeyboardShortcut>

                    <KeyboardShortcut>
                      <Typography variant="body2">Faster movement</Typography>
                      <KeyCombination>
                        <KeyCapBadge>Shift</KeyCapBadge>
                        <KeyCapBadge>+</KeyCapBadge>
                        <KeyCapBadge>Arrow</KeyCapBadge>
                      </KeyCombination>
                    </KeyboardShortcut>

                    <KeyboardShortcut>
                      <Typography variant="body2">Toggle grid snap</Typography>
                      <KeyCombination>
                        <KeyCapBadge>Ctrl</KeyCapBadge>
                        <KeyCapBadge>+</KeyCapBadge>
                        <KeyCapBadge>G</KeyCapBadge>
                      </KeyCombination>
                    </KeyboardShortcut>

                    <KeyboardShortcut>
                      <Typography variant="body2">Toggle guides</Typography>
                      <KeyCombination>
                        <KeyCapBadge>Ctrl</KeyCapBadge>
                        <KeyCapBadge>+</KeyCapBadge>
                        <KeyCapBadge>A</KeyCapBadge>
                      </KeyCombination>
                    </KeyboardShortcut>

                    <KeyboardShortcut>
                      <Typography variant="body2">Delete element</Typography>
                      <KeyCombination>
                        <KeyCapBadge>Del</KeyCapBadge>
                      </KeyCombination>
                    </KeyboardShortcut>

                    <KeyboardShortcut>
                      <Typography variant="body2">Bring forward</Typography>
                      <KeyCombination>
                        <KeyCapBadge>Ctrl</KeyCapBadge>
                        <KeyCapBadge>+</KeyCapBadge>
                        <KeyCapBadge>]</KeyCapBadge>
                      </KeyCombination>
                    </KeyboardShortcut>

                    <KeyboardShortcut>
                      <Typography variant="body2">Send backward</Typography>
                      <KeyCombination>
                        <KeyCapBadge>Ctrl</KeyCapBadge>
                        <KeyCapBadge>+</KeyCapBadge>
                        <KeyCapBadge>[</KeyCapBadge>
                      </KeyCombination>
                    </KeyboardShortcut>
                  </CardContent>
                </ShortcutsCard>
              </Fade>
            </ClickAwayListener>
          )}
        </Popper>
      </Box>
    </Box>
  );
}
