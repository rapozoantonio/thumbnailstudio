// src/utils/textStyler.ts
import { ThumbnailText, ThumbnailStyle } from '../store/thumbnailStore';

/**
 * Processes text content based on text case setting
 */
export const applyTextCase = (text: string, textCase: 'uppercase' | 'normal' | 'lowercase' = 'normal'): string => {
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

/**
 * Determines if we should use gradient text rendering
 */
export const shouldUseGradientText = (
  id: string,
  styleSettings: ThumbnailStyle
): boolean => {
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

/**
 * Creates combined text properties with proper alignment
 * This is a critical function for proper positioning
 */
export const createTextProps = (
  text: string,
  x: number,
  y: number,
  width: number,
  align: string,
  fontSize: number,
  textSettings: ThumbnailText,
  styleSettings: ThumbnailStyle,
  id: string = 'text'
) => {
  // Get the processed text with proper case
  const processedText = applyTextCase(text, textSettings.textCase);
  
  // Get specific style for headline or subtitle
  const isHeadline = id === 'headline';
  const specificStyle = isHeadline ? styleSettings.headlineStyle : styleSettings.subtitleStyle;
  
  // Get styling properties with fallbacks
  const fontFamily = specificStyle?.fontFamily || styleSettings.fontFamily || 'Inter';
  const fontColor = specificStyle?.fontColor || styleSettings.fontColor || '#FFFFFF';
  const fontWeight = specificStyle?.fontWeight || (isHeadline ? 700 : 400);
  
  // Calculate alignment offset - this is crucial for proper positioning
  const offsetX = align === "center" ? width / 2 : align === "right" ? width : 0;
  
  // Determine font style based on bold/italic settings
  let fontStyle = 'normal';
  if (textSettings.textBold && textSettings.textItalic) {
    fontStyle = 'bold italic';
  } else if (textSettings.textBold) {
    fontStyle = 'bold';
  } else if (textSettings.textItalic) {
    fontStyle = 'italic';
  }
  
  // Create shadow properties if enabled
  const shadowProps = styleSettings.fontShadow?.enabled 
    ? {
        shadowColor: styleSettings.fontShadow.color,
        shadowBlur: styleSettings.fontShadow.blur,
        shadowOffsetX: styleSettings.fontShadow.offsetX,
        shadowOffsetY: styleSettings.fontShadow.offsetY,
      }
    : {
        shadowColor: 'transparent',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
      };
  
  // Create outline properties if enabled
  const outlineProps = textSettings.textOutline && styleSettings.fontOutlineWidth > 0
    ? {
        stroke: styleSettings.fontOutlineColor || '#000000',
        strokeWidth: styleSettings.fontOutlineWidth,
      }
    : {
        stroke: 'transparent',
        strokeWidth: 0,
      };
  
  // Return combined props
  return {
    text: processedText,
    x: 0, // Use 0 since we'll position with the parent Group
    y: 0, // Use 0 since we'll position with the parent Group
    offsetX,
    width,
    fontSize,
    fontFamily,
    fontStyle,
    fontWeight,
    fill: fontColor,
    align,
    verticalAlign: 'middle',
    ...shadowProps,
    ...outlineProps,
    // Add hitbox properties to make selection easier
    hitStrokeWidth: 20, // Larger hit area for easier selection
    perfectDrawEnabled: false, // Better performance
  };
};

/**
 * Creates CSS style object for HTML gradient text rendering
 */
export const createGradientTextCss = (
  id: string,
  width: number,
  align: string,
  fontSize: number,
  textSettings: ThumbnailText,
  styleSettings: ThumbnailStyle
): React.CSSProperties => {
  // Get specific style for headline or subtitle
  const isHeadline = id === 'headline';
  const specificStyle = isHeadline ? styleSettings.headlineStyle : styleSettings.subtitleStyle;
  
  // Get styling properties with fallbacks
  const fontFamily = specificStyle?.fontFamily || styleSettings.fontFamily || 'Inter';
  const fontColor = specificStyle?.fontColor || styleSettings.fontColor || '#FFFFFF';
  const fontWeight = specificStyle?.fontWeight || (isHeadline ? 700 : 400);
  
  // Get text gradient
  const textGradient = specificStyle?.textGradient || styleSettings.textGradient;
  const gradientColors = textGradient?.colors || ['#12a480', '#7ff8cf'];
  
  // Calculate alignment offset
  const offsetX = align === "center" ? width / 2 : align === "right" ? width : 0;
  
  // Create base style
  const style: React.CSSProperties = {
    position: 'absolute',
    left: '0',
    top: '0',
    width: `${width}px`,
    textAlign: align as any,
    fontFamily,
    fontWeight,
    fontSize: `${fontSize}px`,
    lineHeight: '1.2',
    // Gradient properties
    background: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: fontColor, // Fallback
    padding: '0',
    margin: '0',
    pointerEvents: 'none', // Important: allow clicks to pass through to the Group
    userSelect: 'none',
    transform: `translate(${-offsetX}px, 0px)` // Handle text alignment
  };
  
  // Add shadow if enabled
  if (styleSettings.fontShadow?.enabled) {
    style.textShadow = `${styleSettings.fontShadow.offsetX}px ${styleSettings.fontShadow.offsetY}px ${styleSettings.fontShadow.blur}px ${styleSettings.fontShadow.color}`;
  }
  
  // Add outline if enabled
  if (textSettings.textOutline && styleSettings.fontOutlineWidth > 0) {
    style.WebkitTextStroke = `${styleSettings.fontOutlineWidth}px ${styleSettings.fontOutlineColor}`;
  }
  
  // Add bold/italic styling
  if (textSettings.textBold) {
    style.fontWeight = 700;
  }
  
  if (textSettings.textItalic) {
    style.fontStyle = 'italic';
  }
  
  return style;
};

/**
 * Creates style for text highlighting background
 */
export const createHighlightRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  align: string,
  textSettings: ThumbnailText
) => {
  if (!textSettings.textHighlight) return null;
  
  // Calculate position based on alignment
  const offsetX = align === "center" ? width / 2 : align === "right" ? width : 0;
  
  return {
    x: x - offsetX,
    y: y - height / 4,
    width,
    height,
    fill: textSettings.textHighlightColor || '#FFFF00',
    opacity: 0.3,
    cornerRadius: 3
  };
};