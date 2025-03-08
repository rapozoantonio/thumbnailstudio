// src/components/thumbnail-canvas/hooks/useGuides.ts
import { useState, useCallback } from 'react';
import { Guide } from '../types';

export const useGuides = (getAllShapesFunc: () => any[]) => {
  const [activeGuides, setActiveGuides] = useState<Guide[]>([]);

  /**
   * Generates alignment guides for snapping
   */
  const generateGuides = useCallback((currentShape: any, allShapes: any[], tolerance: number = 5): Guide[] => {
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
  }, []);

  /**
   * Generates guides for a dragging element
   */
  const generateGuidesForDrag = useCallback((id: string, item: any) => {
    // Get all shapes
    const allShapes = getAllShapesFunc();
    
    // Generate guides based on all other shapes
    const guides = generateGuides(
      item,
      allShapes.filter((shape) => shape.id !== id)
    );

    // Show only the closest guides
    setActiveGuides(guides.slice(0, 4));
  }, [getAllShapesFunc, generateGuides]);

  return {
    activeGuides,
    generateGuidesForDrag,
    setActiveGuides,
  };
};