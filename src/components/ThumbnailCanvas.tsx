import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image, Transformer, Line } from 'react-konva';
import useThumbnailStore from '../store/thumbnailStore';
import useImage from 'use-image';

// 1) Hook to load image assets
const useAssetImage = (src) => {
  const [image] = useImage(src);
  return image;
};

// 2) Renders a faint grid for orientation (guide only).
//    Remove/comment out the layer if you don't want it in your final export.
const renderGrid = (width, height, cellSize = 50) => {
  const lines = [];

  // Vertical lines
  for (let x = 0; x <= width; x += cellSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke="#ffffff"
        strokeWidth={0.5}
        opacity={0.15}
      />
    );
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += cellSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke="#ffffff"
        strokeWidth={0.5}
        opacity={0.15}
      />
    );
  }
  return lines;
};

// 3) DraggableAsset: For images/assets, with <Transformer> if selected
function DraggableAsset({ asset, isSelected, onSelect, onChange }) {
  const shapeRef = useRef(null);
  const trRef = useRef(null);
  const konvaImage = useAssetImage(asset.src);

  // Attach/detach Transformer when selection changes
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (!konvaImage) return null;

  return (
    <>
      <Image
        ref={shapeRef}
        image={konvaImage}
        x={asset.x}
        y={asset.y}
        width={asset.width}
        height={asset.height}
        opacity={asset.opacity}
        rotation={asset.rotation}
        draggable
        onClick={() => onSelect(asset.id)}
        onTap={() => onSelect(asset.id)}
        onDragEnd={(e) => {
          onChange({
            ...asset,
            x: e.target.x(),
            y: e.target.y()
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // reset scale so future transforms are correct
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...asset,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, asset.width * scaleX),
            height: Math.max(5, asset.height * scaleY)
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          anchorSize={8}
          borderDash={[6, 2]}
        />
      )}
    </>
  );
}

// 4) DraggableText: For headline/subtitle. Also shows <Transformer> if selected
function DraggableText({ id, textProps, isSelected, onSelect, onChange }) {
  const shapeRef = useRef(null);
  const trRef = useRef(null);

  // Attach/detach Transformer when selected
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={shapeRef}
        {...textProps}
        draggable
        onClick={() => onSelect(id)}
        onTap={() => onSelect(id)}
        onDragEnd={(e) => {
          onChange({
            ...textProps,
            x: e.target.x(),
            y: e.target.y()
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...textProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.max(5, textProps.fontSize * scaleY)
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          anchorSize={8}
          borderDash={[6, 2]}
        />
      )}
    </>
  );
}

// 5) Main ThumbnailCanvas
export default function ThumbnailCanvas() {
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  // Local state: track whichever item is selected ('headline', 'subtitle', or asset.id)
  const [selectedId, setSelectedId] = useState(null);

  // Pull everything needed from the store
  const { canvasWidth, canvasHeight, style, text } = useThumbnailStore();

  // Redraw when text or style changes
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.getStage().batchDraw();
    }
  }, [text, style]);

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
      // If container is "wider" than needed => limit by height
      if (containerWidth / containerHeight > aspectRatio) {
        scale = containerHeight / canvasHeight;
      } else {
        // Container is "taller" => limit by width
        scale = containerWidth / canvasWidth;
      }

      stage.width(canvasWidth * scale);
      stage.height(canvasHeight * scale);
      stage.scale({ x: scale, y: scale });
      stage.draw();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasWidth, canvasHeight]);

  // Deselect items if user clicks on "empty" area (the stage/layer)
  const handleStageMouseDown = (e) => {
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target === e.target.getLayer();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  // Build gradient or fallback color
  const getBackgroundFill = () => {
    if (!style.backgroundGradient?.enabled) {
      return style.backgroundColor;
    }
    return {
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: canvasWidth, y: canvasHeight },
      fillLinearGradientColorStops: [
        0, style.backgroundGradient.colors[0],
        1, style.backgroundGradient.colors[1]
      ]
    };
  };

  // Headline & subtitle fallback
  const headlineText = text.headline || style.title || 'Your Headline';
  const subtitleText = text.subtitle || style.subtitle || 'Your Subtitle';

  // Position logic
  const getHeadlinePosition = () => {
    let x = canvasWidth / 2;
    let y = canvasHeight / 2;
    if (text.headlineAlignment === 'left') x = 50;
    else if (text.headlineAlignment === 'right') x = canvasWidth - 50;
    if (text.headlinePosition === 'top') y = 100;
    else if (text.headlinePosition === 'bottom') y = canvasHeight - 150;
    return { x, y };
  };
  const headlinePos = getHeadlinePosition();

  const getSubtitlePosition = () => {
    let { x, y } = getHeadlinePosition();
    y += (text.headlineSize || 60) + 20;
    if (text.subtitleAlignment === 'left') x = 50;
    else if (text.subtitleAlignment === 'right') x = canvasWidth - 50;
    return { x, y };
  };
  const subtitlePos = getSubtitlePosition();

  // Default sizes & alignment
  const headlineSize = text.headlineSize || 60;
  const subtitleSize = text.subtitleSize || 30;
  const headlineAlignment = text.headlineAlignment || 'center';
  const subtitleAlignment = text.subtitleAlignment || 'center';

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
      >
        {/* LAYER 1: BACKGROUND (non-listening) */}
        <Layer listening={false}>
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            {...(style.backgroundGradient?.enabled && getBackgroundFill())}
            fill={style.backgroundColor}
          />
        </Layer>

        {/* LAYER 2: GRID (Guide Only, also non-listening) */}
        <Layer listening={false}>
          {renderGrid(canvasWidth, canvasHeight, 50)}
        </Layer>

        {/* LAYER 3: MAIN CONTENT (draggable) */}
        <Layer>
          {/* Draggable assets */}
          {style.assets?.map((asset) => (
            <DraggableAsset
              key={asset.id}
              asset={asset}
              isSelected={selectedId === asset.id}
              onSelect={(id) => setSelectedId(id)}
              onChange={(updatedAsset) => {
                // In a real app, you'd call store.updateAsset(updatedAsset.id, updatedAsset)
                console.log('Asset updated =>', updatedAsset);
              }}
            />
          ))}

          {/* Optional badge logic */}
          {style.badgeStyle && style.badgeStyle !== 'none' && (
            <Rect
              x={
                style.badgeStyle === 'pill' || style.badgeStyle === 'rectangle'
                  ? canvasWidth - 150
                  : 30
              }
              y={
                style.badgeStyle === 'floating' || style.badgeStyle === 'code'
                  ? canvasHeight - 70
                  : 30
              }
              width={100}
              height={40}
              fill={
                style.badgeStyle === 'pill'
                  ? '#2563EB'
                  : style.badgeStyle === 'rectangle'
                  ? '#EF4444'
                  : style.badgeStyle === 'code'
                  ? '#1F2937'
                  : style.badgeStyle === 'floating'
                  ? '#4F46E5'
                  : '#374151'
              }
              cornerRadius={
                style.badgeStyle === 'pill'
                  ? 20
                  : style.badgeStyle === 'rectangle'
                  ? 5
                  : style.badgeStyle === 'code'
                  ? 3
                  : style.badgeStyle === 'floating'
                  ? 8
                  : 0
              }
              opacity={0.9}
            />
          )}
          {style.badgeStyle && style.badgeStyle !== 'none' && (
            <Text
              text="CODE"
              x={
                style.badgeStyle === 'pill' || style.badgeStyle === 'rectangle'
                  ? canvasWidth - 150
                  : 30
              }
              y={
                style.badgeStyle === 'floating' || style.badgeStyle === 'code'
                  ? canvasHeight - 70
                  : 30
              }
              width={100}
              height={40}
              fontSize={16}
              fontFamily={style.badgeStyle === 'code' ? 'Courier New' : style.fontFamily}
              fill="#FFFFFF"
              align="center"
              verticalAlign="middle"
            />
          )}

          {/* Draggable Headline */}
          <DraggableText
            id="headline"
            isSelected={selectedId === 'headline'}
            onSelect={() => setSelectedId('headline')}
            onChange={(updatedHeadline) => {
              console.log('Headline updated =>', updatedHeadline);
            }}
            textProps={{
              text: headlineText,
              x: headlinePos.x,
              y: headlinePos.y,
              fontSize: headlineSize,
              fontFamily: style.fontFamily || 'Inter',
              fill: style.fontColor || '#FFFFFF',
              width: headlineAlignment === 'center' ? canvasWidth - 100 : 600,
              align: headlineAlignment,
              textAlign: headlineAlignment,
              shadowColor: style.fontShadow?.enabled ? style.fontShadow.color : 'transparent',
              shadowBlur: style.fontShadow?.blur || 0,
              shadowOffset: {
                x: style.fontShadow?.offsetX || 0,
                y: style.fontShadow?.offsetY || 0
              },
              strokeWidth: style.fontOutlineWidth || 0,
              stroke: style.fontOutlineColor || 'transparent',
              offsetX:
                headlineAlignment === 'center'
                  ? (canvasWidth - 100) / 2
                  : headlineAlignment === 'right'
                  ? 600
                  : 0
            }}
          />

          {/* Draggable Subtitle */}
          <DraggableText
            id="subtitle"
            isSelected={selectedId === 'subtitle'}
            onSelect={() => setSelectedId('subtitle')}
            onChange={(updatedSubtitle) => {
              console.log('Subtitle updated =>', updatedSubtitle);
            }}
            textProps={{
              text: subtitleText,
              x: subtitlePos.x,
              y: subtitlePos.y,
              fontSize: subtitleSize,
              fontFamily: style.fontFamily || 'Inter',
              fill: style.fontColor || '#FFFFFF',
              width: subtitleAlignment === 'center' ? canvasWidth - 100 : 600,
              align: subtitleAlignment,
              textAlign: subtitleAlignment,
              shadowColor: style.fontShadow?.enabled ? style.fontShadow.color : 'transparent',
              shadowBlur: style.fontShadow?.blur || 0,
              shadowOffset: {
                x: style.fontShadow?.offsetX || 0,
                y: style.fontShadow?.offsetY || 0
              },
              strokeWidth: style.fontOutlineWidth || 0,
              stroke: style.fontOutlineColor || 'transparent',
              offsetX:
                subtitleAlignment === 'center'
                  ? (canvasWidth - 100) / 2
                  : subtitleAlignment === 'right'
                  ? 600
                  : 0
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
