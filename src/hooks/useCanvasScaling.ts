// src/components/hooks/useCanvasScaling.ts
import { useEffect } from 'react';

export const useCanvasScaling = (
  containerRef: React.RefObject<HTMLDivElement>,
  stageRef: React.RefObject<any>,
  canvasWidth: number,
  canvasHeight: number
) => {
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
  }, [canvasWidth, canvasHeight, containerRef, stageRef]);
};