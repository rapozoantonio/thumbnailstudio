import React, { useRef, useEffect, useState, useCallback } from "react";
import { Image, Transformer, Rect, Group } from "react-konva";
import { Asset } from "../../store/thumbnailStore";
import useImage from "use-image";
import { KonvaEventObject } from "konva/lib/Node";

// Define fill modes enum for better type safety and readability
export enum FillMode {
  NONE = "none",
  WIDTH = "width",
  HEIGHT = "height",
  COVER = "cover",  // Fill stage while maintaining aspect ratio (may crop)
  CONTAIN = "contain", // Fit entirely within stage
  STRETCH = "stretch", // Fill entire stage (may distort)
}

/**
 * Loads an image so Konva can render it as a texture.
 */
const useAssetImage = (src: string) => {
  const [image] = useImage(src);
  return image;
};

interface DraggableAssetProps {
  asset: Asset;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onChange: (updatedAsset: Asset) => void;
  onDragStart?: (id: string, asset: Asset) => void;
  onDragMove?: (id: string, asset: Asset) => void;
  onDragEnd?: (id: string, asset: Asset) => void;
  stageSize?: { width: number; height: number };
  preserveAspectRatio?: boolean; // Option to preserve aspect ratio during manual resizing
  backgroundMode?: boolean; // Special handling for background images
}

/**
 * DraggableAsset - Enhanced component for images/icons with drag, resize, rotate, and fill functionality.
 */
function DraggableAsset({
  asset,
  isSelected,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
  stageSize,
  preserveAspectRatio = false, // Default to false for flexibility
  backgroundMode = false, // Default to false
}: DraggableAssetProps) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const loadedImage = useAssetImage(asset.src);
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [currentFillMode, setCurrentFillMode] = useState<FillMode>(FillMode.NONE);
  
  // Store the original size and aspect ratio when the image loads
  useEffect(() => {
    if (loadedImage) {
      setOriginalSize({
        width: loadedImage.width,
        height: loadedImage.height
      });
      
      // If this is a newly added asset and no initial size is set, set it based on the loaded image
      if (asset.width === 0 && asset.height === 0) {
        // Set initial size based on image dimensions, scaled to reasonable size if needed
        const maxInitialWidth = stageSize ? stageSize.width * 0.5 : 300;
        const scale = loadedImage.width > maxInitialWidth ? maxInitialWidth / loadedImage.width : 1;
        
        onChange({
          ...asset,
          width: loadedImage.width * scale,
          height: loadedImage.height * scale,
        });
      }
    }
  }, [loadedImage, asset, onChange, stageSize]);

  // Apply fill mode whenever relevant state changes
  useEffect(() => {
    if (currentFillMode !== FillMode.NONE && stageSize && originalSize) {
      applyFillMode(currentFillMode);
    }
  }, [currentFillMode, stageSize, originalSize]);

  // Handle Escape key press for deselection
  useEffect(() => {
    if (isSelected) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onSelect(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isSelected, onSelect]);

  // Attach Transformer if this asset is selected
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Implement the fill mode functionality as a reusable function
  const applyFillMode = useCallback((mode: FillMode) => {
    if (!stageSize || !originalSize) return;
    
    const aspectRatio = originalSize.width / originalSize.height;
    let newWidth, newHeight, newX, newY;
    
    switch (mode) {
      case FillMode.WIDTH:
        // Fill width maintaining aspect ratio
        newWidth = stageSize.width;
        newHeight = newWidth / aspectRatio;
        newX = 0;
        newY = (stageSize.height - newHeight) / 2;
        break;
        
      case FillMode.HEIGHT:
        // Fill height maintaining aspect ratio
        newHeight = stageSize.height;
        newWidth = newHeight * aspectRatio;
        newX = (stageSize.width - newWidth) / 2;
        newY = 0;
        break;
        
      case FillMode.COVER:
        // Cover the entire stage (maintain aspect ratio but may crop)
        if (stageSize.width / aspectRatio >= stageSize.height) {
          // Width-constrained
          newWidth = stageSize.width;
          newHeight = newWidth / aspectRatio;
        } else {
          // Height-constrained
          newHeight = stageSize.height;
          newWidth = newHeight * aspectRatio;
        }
        // Center the image
        newX = (stageSize.width - newWidth) / 2;
        newY = (stageSize.height - newHeight) / 2;
        break;
        
      case FillMode.CONTAIN:
        // Fit entirely within stage
        if (stageSize.width / aspectRatio <= stageSize.height) {
          // Width-constrained
          newWidth = stageSize.width;
          newHeight = newWidth / aspectRatio;
        } else {
          // Height-constrained
          newHeight = stageSize.height;
          newWidth = newHeight * aspectRatio;
        }
        newX = (stageSize.width - newWidth) / 2;
        newY = (stageSize.height - newHeight) / 2;
        break;
        
      case FillMode.STRETCH:
        // Stretch to fill (may distort)
        newWidth = stageSize.width;
        newHeight = stageSize.height;
        newX = 0;
        newY = 0;
        break;
        
      default:
        return; // No change for NONE
    }
    
    const updatedAsset = {
      ...asset,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      // Reset rotation when using fill modes
      rotation: 0,
    };
    
    onChange(updatedAsset);
    setCurrentFillMode(mode);
  }, [stageSize, originalSize, asset, onChange]);

  // Event handlers
  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    // Clear fill mode when starting to drag
    setCurrentFillMode(FillMode.NONE);
    if (onDragStart) {
      onDragStart(asset.id, asset);
    }
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    if (onDragMove) {
      onDragMove(asset.id, {
        ...asset,
        x: e.target.x(),
        y: e.target.y(),
      });
    }
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    const updatedAsset = {
      ...asset,
      x: e.target.x(),
      y: e.target.y(),
    };
    onChange(updatedAsset);
    if (onDragEnd) {
      onDragEnd(asset.id, updatedAsset);
    }
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    
    // Clear fill mode when manually transforming
    setCurrentFillMode(FillMode.NONE);
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale
    node.scaleX(1);
    node.scaleY(1);
    
    const updatedAsset = {
      ...asset,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(5, asset.width * scaleX),
      height: Math.max(5, asset.height * scaleY),
    };
    
    onChange(updatedAsset);
  };

  // Handle selection of this asset
  const handleSelect = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onSelect(asset.id);
  };

  // Keyboard shortcuts for fill operations
  useEffect(() => {
    if (isSelected) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Only handle if no modifier keys are pressed (for accessibility)
        const noModifiers = !e.ctrlKey && !e.altKey && !e.metaKey;
        if (noModifiers) {
          switch (e.key) {
            case "f": // Fill entire stage (stretch)
              e.preventDefault();
              applyFillMode(FillMode.STRETCH);
              break;
            case "w": // Fill width
              e.preventDefault();
              applyFillMode(FillMode.WIDTH);
              break;
            case "h": // Fill height
              e.preventDefault();
              applyFillMode(FillMode.HEIGHT);
              break;
            case "c": // Contain in stage
              e.preventDefault();
              applyFillMode(FillMode.CONTAIN);
              break;
            case "v": // Cover stage
              e.preventDefault();
              applyFillMode(FillMode.COVER);
              break;
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isSelected, applyFillMode]);

  // Contextual menu on right-click
  useEffect(() => {
    if (isSelected && shapeRef.current) {
      const handleContextMenu = (e: MouseEvent) => {
        if (!isSelected) return;
        e.preventDefault();
        // Create and show a custom context menu
        const menuEl = document.createElement("div");
        menuEl.className = "absolute bg-white shadow-lg rounded-md border border-gray-200 z-50";
        menuEl.style.left = `${e.clientX}px`;
        menuEl.style.top = `${e.clientY}px`;
        
        const menuOptions = [
          { label: "Fill Width (W)", action: () => applyFillMode(FillMode.WIDTH) },
          { label: "Fill Height (H)", action: () => applyFillMode(FillMode.HEIGHT) },
          { label: "Cover Stage (V)", action: () => applyFillMode(FillMode.COVER) },
          { label: "Fit in Stage (C)", action: () => applyFillMode(FillMode.CONTAIN) },
          { label: "Stretch to Fill (F)", action: () => applyFillMode(FillMode.STRETCH) },
          { label: "Reset Transform", action: () => {
            if (originalSize) {
              onChange({
                ...asset,
                width: originalSize.width,
                height: originalSize.height,
                rotation: 0,
                x: (stageSize ? (stageSize.width - originalSize.width) / 2 : asset.x),
                y: (stageSize ? (stageSize.height - originalSize.height) / 2 : asset.y),
              });
              setCurrentFillMode(FillMode.NONE);
            }
          }},
        ];
        
        menuOptions.forEach((option) => {
          const button = document.createElement("button");
          button.className = "block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm";
          button.textContent = option.label;
          button.onclick = () => {
            option.action();
            document.body.removeChild(menuEl);
          };
          menuEl.appendChild(button);
        });
        
        document.body.appendChild(menuEl);
        
        // Remove menu when clicking outside
        const handleOutsideClick = () => {
          if (document.body.contains(menuEl)) {
            document.body.removeChild(menuEl);
          }
          window.removeEventListener("click", handleOutsideClick);
        };
        
        setTimeout(() => {
          window.addEventListener("click", handleOutsideClick);
        }, 0);
      };
      
      shapeRef.current.on("contextmenu", handleContextMenu);
      return () => {
        if (shapeRef.current) {
          shapeRef.current.off("contextmenu", handleContextMenu);
        }
      };
    }
  }, [isSelected, stageSize, originalSize, applyFillMode, asset, onChange]);

  // If the image hasn't loaded yet, return null
  if (!loadedImage) return null;

  // Create a slightly larger hit area for improved selection of small assets
  const createHitArea = () => {
    const padding = 10; // Add padding to make it easier to select small assets
    return (
      <Rect
        x={-padding / 2}
        y={-padding / 2}
        width={asset.width + padding}
        height={asset.height + padding}
        fill="transparent"
        perfectDrawEnabled={false}
      />
    );
  };

  // Special visual treatment for background assets
  const backgroundStyle = backgroundMode ? {
    shadowEnabled: false,
    strokeEnabled: false,
  } : {};

  return (
    <>
      {/* Selection highlight with a better visual indicator for the selected asset */}
      {isSelected && !backgroundMode && (
        <Rect
          x={asset.x - 5}
          y={asset.y - 5}
          width={asset.width + 10}
          height={asset.height + 10}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3B82F6"
          strokeWidth={2}
          cornerRadius={5}
          shadowColor="#3B82F6"
          shadowBlur={8}
          shadowOpacity={0.5}
          perfectDrawEnabled={false}
        />
      )}
      
      {/* Main asset group */}
      <Group
        ref={groupRef}
        x={asset.x}
        y={asset.y}
        rotation={asset.rotation}
        onClick={handleSelect}
        onTap={handleSelect}
        draggable={false}
        listening={true}
      >
        {/* Improved hit area for easier selection */}
        {createHitArea()}
      </Group>
      
      {/* The actual image */}
      <Image
        ref={shapeRef}
        image={loadedImage}
        x={asset.x}
        y={asset.y}
        width={asset.width}
        height={asset.height}
        opacity={asset.opacity}
        rotation={asset.rotation}
        draggable={!backgroundMode}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        {...(asset.filters || {})} // Support for image filters
      />
      
      {/* Enhanced Transformer with better controls */}
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={!backgroundMode}
          enabledAnchors={[
            "top-left",
            "top-center",
            "top-right",
            "middle-left",
            "middle-right",
            "bottom-left",
            "bottom-center",
            "bottom-right",
          ]}
          anchorSize={8}
          anchorCornerRadius={4}
          anchorFill="#3B82F6"
          anchorStroke="#FFFFFF"
          anchorStrokeWidth={1}
          borderStroke="#3B82F6"
          borderStrokeWidth={1.5}
          borderDash={[5, 3]}
          padding={5}
          {...backgroundStyle}
          boundBoxFunc={(oldBox, newBox) => {
            // Prevent scaling to less than 5px
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            
            // Maintain aspect ratio during manual resizing if preserveAspectRatio is enabled
            if (preserveAspectRatio && originalSize) {
              const aspectRatio = originalSize.width / originalSize.height;
              
              // Determine which anchor is being used by checking which dimension changed more
              const widthChange = Math.abs(newBox.width - oldBox.width);
              const heightChange = Math.abs(newBox.height - oldBox.height);
              
              if (widthChange >= heightChange) {
                // Width is changing more, adjust height based on aspect ratio
                newBox.height = newBox.width / aspectRatio;
              } else {
                // Height is changing more, adjust width based on aspect ratio
                newBox.width = newBox.height * aspectRatio;
              }
            }
            
            return newBox;
          }}
        />
      )}
    </>
  );
}

export default DraggableAsset;