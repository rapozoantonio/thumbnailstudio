// src/components/thumbnail-canvas/components/BackgroundImage.tsx
import React, { useState, useEffect } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { Asset } from '../../types';

interface BackgroundImageProps {
  asset: Asset;
  canvasWidth: number;
  canvasHeight: number;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({ 
  asset, 
  canvasWidth, 
  canvasHeight 
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!asset) return;

    const img = new window.Image();
    img.src = asset.src;
    img.onload = () => {
      setImage(img);
    };
  }, [asset]);

  if (!image) return null;

  // Calculate dimensions to cover the entire canvas while maintaining aspect ratio
  const imgRatio = image.width / image.height;
  const canvasRatio = canvasWidth / canvasHeight;

  let width = canvasWidth;
  let height = canvasHeight;

  if (imgRatio > canvasRatio) {
    // Image is wider than canvas
    height = canvasWidth / imgRatio;
  } else {
    // Image is taller than canvas
    width = canvasHeight * imgRatio;
  }

  // Center the image
  const x = (canvasWidth - width) / 2;
  const y = (canvasHeight - height) / 2;

  return (
    <KonvaImage 
      image={image} 
      x={x} 
      y={y} 
      width={width} 
      height={height} 
      listening={false} 
    />
  );
};