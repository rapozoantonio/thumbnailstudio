// src/components/canvas/DraggableAsset.tsx
import React, { useRef, useEffect } from 'react';
import { Image, Transformer, Rect, Group } from 'react-konva';
import { Asset } from '../../store/thumbnailStore';
import useImage from 'use-image';

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
  onSelect: (id: string | null) => void; // Updated to allow null for deselection
  onChange: (updatedAsset: Asset) => void;
  onDragStart?: (id: string, asset: Asset) => void;
  onDragMove?: (id: string, asset: Asset) => void;
  onDragEnd?: (id: string, asset: Asset) => void;
}

/**
 * DraggableAsset - Component for images/icons with drag, resize and rotate functionality.
 * Enhanced with a highlighted selection state and escape key deselection.
 */
function DraggableAsset({ 
  asset, 
  isSelected, 
  onSelect, 
  onChange, 
  onDragStart, 
  onDragMove, 
  onDragEnd 
}: DraggableAssetProps) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const loadedImage = useAssetImage(asset.src);

  // Handle Escape key press for deselection
  useEffect(() => {
    // Only add the event listener if the asset is selected
    if (isSelected) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          // Deselect by passing null to onSelect
          onSelect(null);
        }
      };
      
      // Add the event listener
      window.addEventListener('keydown', handleKeyDown);
      
      // Clean up
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
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

  const handleDragStart = (e: any) => {
    e.cancelBubble = true; // Prevent event bubbling
    
    if (onDragStart) {
      onDragStart(asset.id, asset);
    }
    
    // Log for debugging
    console.log('Asset drag started:', asset.id);
  };

  const handleDragMove = (e: any) => {
    e.cancelBubble = true; // Prevent event bubbling
    
    if (onDragMove) {
      onDragMove(asset.id, {
        ...asset,
        x: e.target.x(),
        y: e.target.y(),
      });
    }
  };

  const handleDragEnd = (e: any) => {
    e.cancelBubble = true; // Prevent event bubbling
    
    const updatedAsset = {
      ...asset,
      x: e.target.x(),
      y: e.target.y(),
    };
    
    onChange(updatedAsset);
    
    if (onDragEnd) {
      onDragEnd(asset.id, updatedAsset);
    }
    
    // Log for debugging
    console.log('Asset drag ended:', asset.id, updatedAsset.x, updatedAsset.y);
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale so next transform is normal
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
    
    // Log for debugging
    console.log('Asset transform ended:', asset.id, 'new size:', updatedAsset.width, 'x', updatedAsset.height);
  };

  // Handle selection of this asset
  const handleSelect = (e: any) => {
    e.cancelBubble = true; // Prevent event bubbling
    onSelect(asset.id);
  };

  // If the image hasn't loaded yet, return null
  if (!loadedImage) return null;

  // Create a slightly larger hit area for improved selection of small assets
  const createHitArea = () => {
    const padding = 10; // Add padding to make it easier to select small assets
    return (
      <Rect
        x={-padding/2}
        y={-padding/2}
        width={asset.width + padding}
        height={asset.height + padding}
        fill="transparent"
        perfectDrawEnabled={false}
      />
    );
  };

  return (
    <>
      {/* Selection highlight/glow - visible only when selected */}
      {isSelected && (
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
        draggable={false} // We'll make the Image draggable instead
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
        draggable={true}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      
      {/* Transformer for resizing and rotating */}
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          anchorSize={10}
          anchorCornerRadius={5}
          anchorFill="#3B82F6"
          anchorStroke="#FFFFFF"
          anchorStrokeWidth={1}
          borderStroke="#3B82F6"
          borderStrokeWidth={1.5}
          borderDash={[5, 3]}
          padding={5}
          boundBoxFunc={(oldBox, newBox) => {
            // Prevent scaling to less than 5px
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

export default DraggableAsset;