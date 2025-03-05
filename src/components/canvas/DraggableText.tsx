// src/components/canvas/DraggableText.tsx
import React, { useRef, useEffect } from 'react';
import { Text, Transformer, Rect, Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import { ThumbnailText, ThumbnailStyle } from '../../store/thumbnailStore';

interface TextProps {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  width: number;
  align: string;
  isSelected: boolean;
  textSettings: ThumbnailText;
  styleSettings: ThumbnailStyle;
  onSelect: (id: string | null) => void; // Updated to allow null for deselection
  onChange: (id: string, updatedProps: any) => void;
  onDragStart?: (id: string, props: any) => void;
  onDragMove?: (id: string, props: any) => void;
  onDragEnd?: (id: string, props: any) => void;
}

/**
 * Enhanced DraggableText component with support for all text styling options
 * including gradient text
 */
const DraggableText: React.FC<TextProps> = ({
  id,
  text,
  x,
  y,
  fontSize,
  width,
  align,
  isSelected,
  textSettings,
  styleSettings,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd
}) => {
  const textRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  
  // Apply text case transformation
  const applyTextCase = (text: string, textCase: 'uppercase' | 'normal' | 'lowercase' = 'normal'): string => {
    if (!text) return '';
    
    switch (textCase) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'normal':
      default:
        return text;
    }
  };

  const displayText = applyTextCase(text, textSettings.textCase);
  
  // Calculate offset based on alignment
  const offsetX = align === "center" ? width / 2 : align === "right" ? width : 0;
  
  // Determine if we should use gradient text
  const useGradientText = () => {
    // Check for specific style first, then fallback to general style
    const isHeadline = id === 'headline';
    const specificStyle = isHeadline ? styleSettings.headlineStyle : styleSettings.subtitleStyle;
    
    // Check if specific style has gradient enabled
    if (specificStyle?.textGradient?.enabled) {
      return true;
    }
    
    // Otherwise check general gradient
    return styleSettings.textGradient?.enabled || false;
  };
  
  // Calculate text height approximation
  const textHeight = fontSize * 1.2;
  
  // Handle Escape key press for deselection
  useEffect(() => {
    // Only add the event listener if the text is selected
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
  
  // Attach Transformer when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  
  // Handle events with proper shape data
  const handleDragStart = (e: any) => {
    if (!onDragStart) return;
    
    // Include width and height for proper guide calculations
    onDragStart(id, { 
      id,
      x: e.target.x(), 
      y: e.target.y(), 
      fontSize,
      width,
      height: textHeight
    });
  };

  const handleDragMove = (e: any) => {
    if (!onDragMove) return;
    
    // Include width and height for proper guide calculations
    onDragMove(id, { 
      id,
      x: e.target.x(), 
      y: e.target.y(), 
      fontSize,
      width,
      height: textHeight
    });
  };

  const handleDragEnd = (e: any) => {
    console.log('Drag ended:', e.target.x(), e.target.y());
    
    // Notify parent of position change
    const updatedProps = {
      id,
      x: e.target.x(),
      y: e.target.y(),
      fontSize,
      width
    };
    
    onChange(id, updatedProps);
    
    if (onDragEnd) {
      onDragEnd(id, updatedProps);
    }
  };
  
  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    
    // Get current transform values
    const scaleX = node.scaleX();
    
    // Reset scale
    node.scaleX(1);
    node.scaleY(1);
    
    // Update with new size
    const updatedProps = {
      id,
      x: node.x(),
      y: node.y(),
      width: Math.max(50, Math.round(width * scaleX)),
    };
    
    onChange(id, updatedProps);
  };
  
  // Handle click - call onSelect with current id
  const handleSelect = (e: any) => {
    e.cancelBubble = true; // Prevent event bubbling
    onSelect(id);
  };

  // Get specific styling for this text element (headline or subtitle)
  const getTextStyles = () => {
    const isHeadline = id === "headline";
    const specificStyle = isHeadline ? styleSettings.headlineStyle : styleSettings.subtitleStyle;
    
    // Get properties with fallbacks
    return {
      fontFamily: specificStyle?.fontFamily || styleSettings.fontFamily || 'Inter',
      fontColor: specificStyle?.fontColor || styleSettings.fontColor || '#FFFFFF',
      fontWeight: specificStyle?.fontWeight || (isHeadline ? 700 : 400),
      textGradient: specificStyle?.textGradient || styleSettings.textGradient
    };
  };
  
  // Render text content based on gradient requirements
  const renderTextContent = () => {
    const shouldUseGradient = useGradientText();
    const styles = getTextStyles();
    
    if (shouldUseGradient) {
      // Get gradient colors
      const textGradient = styles.textGradient;
      const gradientColors = textGradient?.colors || ['#12a480', '#7ff8cf'];
      
      // CSS style for HTML gradient text
      const gradientStyle: React.CSSProperties = {
        position: 'absolute',
        left: '0',
        top: '0',
        width: `${width}px`,
        textAlign: align as any,
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        fontSize: `${fontSize}px`,
        lineHeight: '1.2',
        // Gradient properties
        background: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: styles.fontColor, // Fallback
        padding: '0',
        margin: '0',
        pointerEvents: 'none', // Important: allow clicks to pass through to the Group
        userSelect: 'none',
        transform: `translate(${-offsetX}px, 0px)`, // Handle text alignment
        // Make sure this doesn't interfere with Group dragging
        touchAction: 'none'
      };
      
      // Add shadow if enabled
      if (styleSettings.fontShadow?.enabled) {
        gradientStyle.textShadow = `${styleSettings.fontShadow.offsetX}px ${styleSettings.fontShadow.offsetY}px ${styleSettings.fontShadow.blur}px ${styleSettings.fontShadow.color}`;
      }
      
      // Add outline if enabled
      if (textSettings.textOutline && styleSettings.fontOutlineWidth > 0) {
        gradientStyle.WebkitTextStroke = `${styleSettings.fontOutlineWidth}px ${styleSettings.fontOutlineColor}`;
      }
      
      return (
        <Html>
          <div style={gradientStyle}>
            {displayText}
          </div>
        </Html>
      );
    } else {
      // For non-gradient text, use Konva Text
      let fontStyle = 'normal';
      if (textSettings.textBold && textSettings.textItalic) {
        fontStyle = 'bold italic';
      } else if (textSettings.textBold) {
        fontStyle = 'bold';
      } else if (textSettings.textItalic) {
        fontStyle = 'italic';
      }
      
      return (
        <Text
          ref={textRef}
          text={displayText}
          width={width}
          offsetX={offsetX}
          fontSize={fontSize}
          fontFamily={styles.fontFamily}
          fill={styles.fontColor}
          fontStyle={fontStyle}
          fontWeight={styles.fontWeight}
          align={align}
          shadowColor={styleSettings.fontShadow?.enabled ? styleSettings.fontShadow.color : "transparent"}
          shadowBlur={styleSettings.fontShadow?.blur || 0}
          shadowOffsetX={styleSettings.fontShadow?.offsetX || 0}
          shadowOffsetY={styleSettings.fontShadow?.offsetY || 0}
          stroke={textSettings.textOutline ? (styleSettings.fontOutlineColor || "#000000") : "transparent"}
          strokeWidth={textSettings.textOutline ? (styleSettings.fontOutlineWidth || 1) : 0}
          perfectDrawEnabled={false}
        />
      );
    }
  };

  // Create a background rect to improve dragging hitbox
  const dragBackgroundRect = (
    <Rect 
      width={width}
      height={textHeight}
      fill="transparent" // Invisible but still catches mouse events
      perfectDrawEnabled={false}
    />
  );

  return (
    <>
      {/* Selection highlight background */}
      {isSelected && (
        <Rect
          x={x - offsetX - 5}
          y={y - 5}
          width={width + 10}
          height={textHeight + 10}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3B82F6"
          strokeWidth={1.5}
          cornerRadius={3}
          dash={[5, 3]}
          perfectDrawEnabled={false}
        />
      )}
      
      {/* Text highlight background if enabled */}
      {textSettings.textHighlight && (
        <Rect
          x={x - offsetX}
          y={y - textHeight / 4}
          width={width}
          height={textHeight}
          fill={textSettings.textHighlightColor || "#FFFF00"}
          opacity={0.3}
          cornerRadius={3}
        />
      )}
      
      {/* Main Group with text content */}
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={textHeight}
        draggable={true} // Always keep draggable true
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        // Add hit detection properties
        listening={true}
      >
        {/* Add invisible background rect for better dragging */}
        {dragBackgroundRect}
        {/* The actual text content */}
        {renderTextContent()}
      </Group>
      
      {/* Transformer for resizing - only show when selected */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          enabledAnchors={["middle-left", "middle-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to reasonable width
            if (newBox.width < 50) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={10}
          anchorCornerRadius={5}
          anchorFill="#3B82F6"
          anchorStroke="#FFFFFF"
          anchorStrokeWidth={1}
          borderStroke="#3B82F6"
          borderStrokeWidth={1.5}
          borderDash={[5, 3]}
          padding={5}
        />
      )}
    </>
  );
};

export default DraggableText;