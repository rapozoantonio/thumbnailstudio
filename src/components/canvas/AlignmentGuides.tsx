// src/components/thumbnail-canvas/components/AlignmentGuides.tsx
import React from 'react';
import { Line } from 'react-konva';
import { Guide } from '../../types';

interface AlignmentGuidesProps {
  guides: Guide[];
  canvasWidth: number;
  canvasHeight: number;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ 
  guides, 
  canvasWidth, 
  canvasHeight 
}) => {
  return (
    <>
      {guides.map((guide, i) => {
        const points = guide.isHorizontal
          ? [0, guide.position, canvasWidth, guide.position]
          : [guide.position, 0, guide.position, canvasHeight];
        return (
          <Line 
            key={i} 
            points={points} 
            stroke="#2196F3" 
            strokeWidth={1} 
            dash={[5, 5]} 
          />
        );
      })}
    </>
  );
};