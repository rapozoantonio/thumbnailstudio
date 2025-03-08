// src/components/thumbnail-canvas/utils/styling.ts

/**
 * Generates the fill properties for a gradient background
 */
export const getBackgroundFill = (
    gradient: { type: 'linear' | 'radial'; colors: string[] }, 
    canvasWidth: number, 
    canvasHeight: number
  ) => {
    return {
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: {
        x: gradient.type === "linear" ? canvasWidth : canvasWidth / 2,
        y: gradient.type === "linear" ? canvasHeight : canvasHeight / 2,
      },
      fillLinearGradientColorStops: [0, gradient.colors[0], 1, gradient.colors[1]],
    };
  };
  
  /**
   * Creates properties for text styling
   */
  export const createTextProps = (
    settings: any, 
    id: string, 
    align: string
  ) => {
    const isHeadline = id === 'headline';
    
    // Default text props
    const props = {
      fontFamily: settings.fontFamily || 'Arial',
      fontStyle: 'normal',
      align: align || 'center',
      verticalAlign: 'middle',
      fill: '#FFFFFF',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 0,
      shadowOffset: { x: 0, y: 0 },
      shadowOpacity: 0,
      strokeWidth: 0,
      stroke: '#000000',
    };
    
    // Apply text effects if defined
    if (settings.textEffects) {
      if (settings.textEffects.shadow?.enabled) {
        props.shadowBlur = settings.textEffects.shadow.blur || 4;
        props.shadowOffset = { 
          x: settings.textEffects.shadow.offsetX || 2, 
          y: settings.textEffects.shadow.offsetY || 2 
        };
        props.shadowOpacity = settings.textEffects.shadow.opacity || 0.5;
      }
      
      if (settings.textEffects.stroke?.enabled) {
        props.strokeWidth = settings.textEffects.stroke.width || 1;
        props.stroke = settings.textEffects.stroke.color || '#000000';
      }
      
      // Apply specific color for headline or subtitle
      if (isHeadline && settings.textEffects.headlineColor) {
        props.fill = settings.textEffects.headlineColor;
      } else if (!isHeadline && settings.textEffects.subtitleColor) {
        props.fill = settings.textEffects.subtitleColor;
      }
    }
    
    return props;
  };