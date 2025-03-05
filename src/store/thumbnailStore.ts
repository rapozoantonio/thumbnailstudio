// src/store/thumbnailStore.ts
import { create } from "zustand";
import { RefObject } from "react";
import { Stage } from "konva";
import enhancedThumbnailStyles from "../utils/thumbnailStyles";

/**
 * Enhanced thumbnail style presets with cutting-edge designs and cool styling.
 * Each preset is compatible with our ThumbnailStyle in the store (with small mapping).
 */

// ----------------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------------

export type Asset = {
  id: string;
  src: string;
  type: "image" | "icon" | "shape";
  position: "left" | "right" | "center";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
};

export type Position = {
  x: number;
  y: number;
};

export type ThumbnailStyle = {
  backgroundColor: string;
  backgroundGradient: {
    enabled: boolean;
    type: "linear" | "radial";
    colors: string[];
    angle: number;
  };
  fontFamily: string;
  fontColor: string;
  fontOutlineColor: string;
  fontOutlineWidth: number;
  fontShadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  assets: Asset[];
  badgeStyle?: "none" | "pill" | "rectangle" | "code" | "floating";

  // Properties for gradient text
  textGradient?: {
    enabled: boolean;
    colors: string[];
    direction?: string; // For parsing from enhancedThumbnailStyles
    angle?: number; // For the store's internal use
  };

  // Font properties
  fontWeight?: number;
  fontSize?: number;

  // Specific styles for headline and subtitle
  headlineStyle?: {
    fontFamily?: string;
    fontColor?: string;
    fontWeight?: number;
    textGradient?: {
      enabled: boolean;
      colors: string[];
      direction?: string;
      angle?: number;
    };
  };

  subtitleStyle?: {
    fontFamily?: string;
    fontColor?: string;
    fontWeight?: number;
    textGradient?: {
      enabled: boolean;
      colors: string[];
      direction?: string;
      angle?: number;
    };
  };
};

export type ThumbnailText = {
  headline: string;
  subtitle: string;
  headlineSize: number;
  subtitleSize: number;

  /**
   * Vertical placement for the headline and subtitle
   * (e.g. used for "top", "middle", "bottom" toggles).
   */
  headlinePosition: "top" | "middle" | "bottom";
  subtitlePosition: "top" | "middle" | "bottom";

  /**
   * Horizontal alignment for the headline and subtitle
   * (e.g. used for "left", "center", "right" toggles).
   */
  headlineAlignment: "left" | "center" | "right";
  subtitleAlignment: "left" | "center" | "right";

  /**
   * Optional absolute positioning if you allow dragging or custom placement.
   * If set, it can override the standard [head|sub]titlePosition logic.
   */
  headlineCustomPosition?: Position | null;
  subtitleCustomPosition?: Position | null;

  // Text styling properties
  textCase: "uppercase" | "normal" | "lowercase";
  textBold: boolean;
  textItalic?: boolean;
  textHighlight: boolean;
  textHighlightColor?: string;
  textOutline: boolean;
};

/**
 * Each variation includes a style + text combination
 * that can be quickly switched to.
 */
export type ThumbnailVariation = {
  id: string;
  name: string;
  style: ThumbnailStyle;
  text: ThumbnailText;
};

// For history tracking
export type ThumbnailSnapshot = {
  style: ThumbnailStyle;
  text: ThumbnailText;
};

export type ThumbnailState = {
  currentStep: 1 | 2 | 3;
  canvasWidth: number;
  canvasHeight: number;
  style: ThumbnailStyle;
  text: ThumbnailText;
  variations: ThumbnailVariation[];
  selectedVariationId: string | null;

  // Canvas settings
  gridSize: number;
  snapToGridEnabled: boolean;
  showGuides: boolean;

  // History for undo/redo
  history: ThumbnailSnapshot[];
  historyIndex: number;

  // Stage reference
  stageRef: RefObject<Stage> | null;
  setStageRef: (ref: RefObject<Stage>) => void;

  // Steps
  setCurrentStep: (step: 1 | 2 | 3) => void;

  // Style/Text Updates
  updateStyle: (style: Partial<ThumbnailStyle>) => void;
  updateText: (text: Partial<ThumbnailText>) => void;

  // Asset management
  addAsset: (asset: Omit<Asset, "id">) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  removeAsset: (id: string) => void;

  // Variations
  generateVariations: () => void;
  selectVariation: (id: string) => void;

  // Reset
  resetStore: () => void;

  // Enhanced positioning actions
  updateHeadlinePosition: (position: Position) => void;
  updateSubtitlePosition: (position: Position) => void;

  // Canvas settings
  setGridSize: (size: number) => void;
  toggleSnapToGrid: () => void;
  toggleGuides: () => void;

  // Z-index management
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // History
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Apply one of the enhancedThumbnailStyles by ID
  applyEnhancedStyle: (styleId: string) => void;
};

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

// Helper to convert a string direction into an angle for our linear gradients.
function directionToAngle(direction: string): number {
  switch (direction) {
    case "to right":
      return 0;
    case "to bottom":
      return 90;
    case "to bottom right":
      return 135;
    case "to bottom left":
      return 225;
    case "to left":
      return 180;
    case "to top":
      return 270;
    case "to top right":
      return 45;
    case "to top left":
      return 315;
    default:
      return 0;
  }
}

// Helper to convert an angle back to a CSS direction string
function angleToDirection(angle: number): string {
  switch (angle) {
    case 0:
      return "to right";
    case 90:
      return "to bottom";
    case 135:
      return "to bottom right";
    case 225:
      return "to bottom left";
    case 180:
      return "to left";
    case 270:
      return "to top";
    case 45:
      return "to top right";
    case 315:
      return "to top left";
    default:
      return "to right";
  }
}

// Helper functions for initial text positioning
function getInitialHeadlinePosition(
  canvasWidth: number, 
  canvasHeight: number, 
  alignment: "left" | "center" | "right", 
  position: "top" | "middle" | "bottom"
): Position {
  // Calculate x position based on alignment
  let x = canvasWidth / 2;  // Default (center)
  if (alignment === "left") x = 100;
  else if (alignment === "right") x = canvasWidth - 100;
  
  // Calculate y position based on position
  let y = canvasHeight / 2;  // Default (middle)
  if (position === "top") y = 100;
  else if (position === "bottom") y = canvasHeight - 150;
  
  return { x, y };
}

function getInitialSubtitlePosition(
  canvasWidth: number,
  canvasHeight: number,
  headlinePos: Position,
  headlineSize: number,
  alignment: "left" | "center" | "right",
  position: "top" | "middle" | "bottom"
): Position {
  // Start with headline position
  let x = headlinePos.x;
  let y = headlinePos.y + headlineSize + 20;  // Place below headline with some margin
  
  // Adjust x based on alignment
  if (alignment === "left") x = 100;
  else if (alignment === "right") x = canvasWidth - 100;
  
  // Adjust y if needed for specific positions
  if (position === "top" && headlinePos.y > 150) y = 150;
  else if (position === "bottom" && headlinePos.y < canvasHeight - 200) y = canvasHeight - 100;
  
  return { x, y };
}

// ----------------------------------------------------------------------------
// INITIAL VALUES
// ----------------------------------------------------------------------------

// Canvas dimensions
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

// Define initial text values before calculating positions
const initialTextBase = {
  headline: "YOUR HEADLINE HERE",
  subtitle: "Your subtitle here",
  headlineSize: 48,
  subtitleSize: 24,
  headlinePosition: "middle" as "top" | "middle" | "bottom",
  subtitlePosition: "middle" as "top" | "middle" | "bottom",
  headlineAlignment: "center" as "left" | "center" | "right",
  subtitleAlignment: "center" as "left" | "center" | "right",
  textCase: "normal" as "uppercase" | "normal" | "lowercase",
  textBold: false,
  textItalic: false,
  textHighlight: false,
  textHighlightColor: "#FFFF00",
  textOutline: false,
};

// Calculate initial positions
const initialHeadlinePos = getInitialHeadlinePosition(
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  initialTextBase.headlineAlignment,
  initialTextBase.headlinePosition
);

const initialSubtitlePos = getInitialSubtitlePosition(
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  initialHeadlinePos,
  initialTextBase.headlineSize,
  initialTextBase.subtitleAlignment,
  initialTextBase.subtitlePosition
);

// Complete initial text with positions
const initialText: ThumbnailText = {
  ...initialTextBase,
  headlineCustomPosition: initialHeadlinePos,
  subtitleCustomPosition: initialSubtitlePos,
};

// Define initial style
const initialStyle: ThumbnailStyle = {
  backgroundColor: "#1E293B",
  backgroundGradient: {
    enabled: false,
    type: "linear",
    colors: ["#3B82F6", "#10B981"],
    angle: 45,
  },
  fontFamily: "Inter",
  fontColor: "#FFFFFF",
  fontOutlineColor: "#000000",
  fontOutlineWidth: 0,
  fontShadow: {
    enabled: true,
    color: "rgba(0, 0, 0, 0.5)",
    blur: 10,
    offsetX: 2,
    offsetY: 2,
  },
  // Add text gradient with default values
  textGradient: {
    enabled: false,
    colors: ["#FFFFFF", "#FFFFFF"],
    angle: 0,
  },
  // Add headline and subtitle specific styling
  headlineStyle: {
    fontFamily: "Inter",
    fontColor: "#FFFFFF",
    fontWeight: 700,
    textGradient: {
      enabled: false,
      colors: ["#FFFFFF", "#FFFFFF"],
      angle: 0,
    },
  },
  subtitleStyle: {
    fontFamily: "Inter",
    fontColor: "#FFFFFF",
    fontWeight: 400,
    textGradient: {
      enabled: false,
      colors: ["#FFFFFF", "#FFFFFF"],
      angle: 0,
    },
  },
  assets: [],
  badgeStyle: "none",
};

// ----------------------------------------------------------------------------
// STORE IMPLEMENTATION
// ----------------------------------------------------------------------------

const useThumbnailStore = create<ThumbnailState>((set, get) => ({
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  currentStep: 1,
  canvasWidth: CANVAS_WIDTH,
  canvasHeight: CANVAS_HEIGHT,
  style: initialStyle,
  text: initialText,
  variations: [],
  selectedVariationId: null,

  // Canvas settings
  gridSize: 50,
  snapToGridEnabled: true,
  showGuides: true,

  // History for undo/redo
  history: [],
  historyIndex: -1,

  // Stage reference
  stageRef: null,
  setStageRef: (ref) => set(() => ({ stageRef: ref })),

  // --------------------------------------------------------------------------
  // Steps
  // --------------------------------------------------------------------------
  setCurrentStep: (step) => set({ currentStep: step }),

  // --------------------------------------------------------------------------
  // Style Updates with proper deep merging for nested objects
  // --------------------------------------------------------------------------
  updateStyle: (newStyle) => {
    set((state) => {
      // Create a copy of the newStyle to avoid modifying the original
      const updatedStyle = { ...newStyle };
      
      // Handle nested objects: fontShadow
      if (updatedStyle.fontShadow) {
        updatedStyle.fontShadow = {
          ...state.style.fontShadow,
          ...updatedStyle.fontShadow,
        };
      }
      
      // Handle nested objects: textGradient
      if (updatedStyle.textGradient) {
        updatedStyle.textGradient = {
          ...state.style.textGradient,
          ...updatedStyle.textGradient,
        };
      }
      
      // Handle nested objects: headlineStyle
      if (updatedStyle.headlineStyle) {
        updatedStyle.headlineStyle = {
          ...state.style.headlineStyle,
          ...updatedStyle.headlineStyle,
        };
        
        // Special handling for nested textGradient inside headlineStyle
        if (updatedStyle.headlineStyle.textGradient) {
          updatedStyle.headlineStyle.textGradient = {
            ...state.style.headlineStyle?.textGradient,
            ...updatedStyle.headlineStyle.textGradient,
          };
        }
      }
      
      // Handle nested objects: subtitleStyle
      if (updatedStyle.subtitleStyle) {
        updatedStyle.subtitleStyle = {
          ...state.style.subtitleStyle,
          ...updatedStyle.subtitleStyle,
        };
        
        // Special handling for nested textGradient inside subtitleStyle
        if (updatedStyle.subtitleStyle.textGradient) {
          updatedStyle.subtitleStyle.textGradient = {
            ...state.style.subtitleStyle?.textGradient,
            ...updatedStyle.subtitleStyle.textGradient,
          };
        }
      }
      
      return { style: { ...state.style, ...updatedStyle } };
    });
  },

  // --------------------------------------------------------------------------
  // Text Updates
  // --------------------------------------------------------------------------
  updateText: (newText) => {
    set((state) => {
      const oldText = state.text;

      // If toggling text outline, optionally sync style.fontOutlineWidth
      if (newText.textOutline !== undefined && newText.textOutline !== oldText.textOutline) {
        set((innerState) => ({
          style: {
            ...innerState.style,
            fontOutlineWidth: newText.textOutline ? 1 : 0,
          },
        }));
      }

      // Return updated text
      return {
        text: { ...oldText, ...newText },
      };
    });
  },

  // --------------------------------------------------------------------------
  // Asset management
  // --------------------------------------------------------------------------
  addAsset: (asset) =>
    set((state) => {
      // Find max zIndex
      const maxZIndex = state.style.assets.length ? Math.max(...state.style.assets.map((a) => a.zIndex)) : 0;
      const newAsset = {
        ...asset,
        id: crypto.randomUUID(),
        zIndex: maxZIndex + 1,
      };
      return {
        style: {
          ...state.style,
          assets: [...state.style.assets, newAsset],
        },
      };
    }),

  updateAsset: (id, assetUpdate) =>
    set((state) => ({
      style: {
        ...state.style,
        assets: state.style.assets.map((asset) => (asset.id === id ? { ...asset, ...assetUpdate } : asset)),
      },
    })),

  removeAsset: (id) =>
    set((state) => ({
      style: {
        ...state.style,
        assets: state.style.assets.filter((asset) => asset.id !== id),
      },
    })),

  // --------------------------------------------------------------------------
  // Variations
  // --------------------------------------------------------------------------
  generateVariations: () =>
    set((state) => {
      const variations: ThumbnailVariation[] = [
        {
          id: crypto.randomUUID(),
          name: "Text Emphasis",
          style: {
            ...state.style,
            assets: state.style.assets.map((asset) => ({
              ...asset,
              width: asset.width * 0.8,
              height: asset.height * 0.8,
              position: "right",
              x: state.canvasWidth * 0.7,
              y: state.canvasHeight * 0.5 - asset.height * 0.4,
            })),
            fontShadow: {
              ...state.style.fontShadow,
              enabled: true,
              blur: 12,
            },
          },
          text: {
            ...state.text,
            headlineSize: state.text.headlineSize * 1.2,
            // Example override: align everything left
            headlineAlignment: "left",
            subtitleAlignment: "left",
            textBold: true,
          },
        },
        {
          id: crypto.randomUUID(),
          name: "Asset Emphasis",
          style: {
            ...state.style,
            assets: state.style.assets.map((asset) => ({
              ...asset,
              width: asset.width * 1.2,
              height: asset.height * 1.2,
              position: "left",
              x: state.canvasWidth * 0.3,
              y: state.canvasHeight * 0.5 - asset.height * 0.6,
            })),
          },
          text: {
            ...state.text,
            headlineSize: state.text.headlineSize * 0.9,
            headlineAlignment: "right",
            subtitleAlignment: "right",
            textCase: "uppercase",
          },
        },
        {
          id: crypto.randomUUID(),
          name: "Balanced",
          style: {
            ...state.style,
            assets: state.style.assets.map((asset) => ({
              ...asset,
              position: "center",
              x: state.canvasWidth * 0.5 - asset.width / 2,
              y: state.canvasHeight * 0.3 - asset.height / 2,
            })),
            fontOutlineWidth: 1,
          },
          text: {
            ...state.text,
            // Example override: place headline at bottom
            headlinePosition: "bottom",
            headlineAlignment: "center",
            subtitleAlignment: "center",
            textOutline: true,
          },
        },
        {
          id: crypto.randomUUID(),
          name: "High Contrast",
          style: {
            ...state.style,
            backgroundGradient: {
              ...state.style.backgroundGradient,
              enabled: true,
              colors: ["#000000", "#333333"],
            },
            fontShadow: {
              enabled: false,
              color: "rgba(0, 0, 0, 0)",
              blur: 0,
              offsetX: 0,
              offsetY: 0,
            },
            fontOutlineWidth: 0,
          },
          text: {
            ...state.text,
            headlineAlignment: "center",
            subtitleAlignment: "center",
            textHighlight: true,
            textBold: true,
          },
        },
      ];

      return {
        variations,
        selectedVariationId: variations[0].id,
      };
    }),

  selectVariation: (id) =>
    set((state) => {
      const variation = state.variations.find((v) => v.id === id);
      if (!variation) {
        return { selectedVariationId: id };
      }
      // Apply the variation
      return {
        selectedVariationId: id,
        style: variation.style,
        text: variation.text,
      };
    }),

  // --------------------------------------------------------------------------
  // Reset everything
  // --------------------------------------------------------------------------
  resetStore: () =>
    set({
      currentStep: 1,
      style: initialStyle,
      text: initialText,
      variations: [],
      selectedVariationId: null,
      stageRef: null,
      history: [],
      historyIndex: -1,
    }),

  // --------------------------------------------------------------------------
  // Enhanced positioning
  // --------------------------------------------------------------------------
  updateHeadlinePosition: (position) =>
    set((state) => ({
      text: {
        ...state.text,
        headlineCustomPosition: position,
      },
    })),

  updateSubtitlePosition: (position) =>
    set((state) => ({
      text: {
        ...state.text,
        subtitleCustomPosition: position,
      },
    })),

  // --------------------------------------------------------------------------
  // Canvas settings
  // --------------------------------------------------------------------------
  setGridSize: (size) => set({ gridSize: size }),
  toggleSnapToGrid: () => set((state) => ({ snapToGridEnabled: !state.snapToGridEnabled })),
  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),

  // --------------------------------------------------------------------------
  // Z-index management
  // --------------------------------------------------------------------------
  bringForward: (id) =>
    set((state) => {
      const assets = [...state.style.assets];
      assets.sort((a, b) => a.zIndex - b.zIndex);

      const index = assets.findIndex((asset) => asset.id === id);
      if (index < assets.length - 1) {
        // Swap zIndex with the next item
        const tmp = assets[index].zIndex;
        assets[index].zIndex = assets[index + 1].zIndex;
        assets[index + 1].zIndex = tmp;
      }

      return { style: { ...state.style, assets } };
    }),

  sendBackward: (id) =>
    set((state) => {
      const assets = [...state.style.assets];
      assets.sort((a, b) => a.zIndex - b.zIndex);

      const index = assets.findIndex((asset) => asset.id === id);
      if (index > 0) {
        // Swap zIndex with the previous item
        const tmp = assets[index].zIndex;
        assets[index].zIndex = assets[index - 1].zIndex;
        assets[index - 1].zIndex = tmp;
      }

      return { style: { ...state.style, assets } };
    }),

  bringToFront: (id) =>
    set((state) => {
      const assets = [...state.style.assets];
      const maxZIndex = Math.max(...assets.map((a) => a.zIndex || 0));

      return {
        style: {
          ...state.style,
          assets: assets.map((a) => (a.id === id ? { ...a, zIndex: maxZIndex + 1 } : a)),
        },
      };
    }),

  sendToBack: (id) =>
    set((state) => {
      const assets = [...state.style.assets];
      const minZIndex = Math.min(...assets.map((a) => a.zIndex || 0));

      return {
        style: {
          ...state.style,
          assets: assets.map((a) => (a.id === id ? { ...a, zIndex: minZIndex - 1 } : a)),
        },
      };
    }),

  // --------------------------------------------------------------------------
  // History
  // --------------------------------------------------------------------------
  saveToHistory: () =>
    set((state) => {
      const snapshot: ThumbnailSnapshot = {
        // Deep clone
        style: JSON.parse(JSON.stringify(state.style)),
        text: JSON.parse(JSON.stringify(state.text)),
      };
      // If we've undone some steps, remove "future" history
      const truncated = state.history.slice(0, state.historyIndex + 1);

      return {
        history: [...truncated, snapshot],
        historyIndex: truncated.length,
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const snapshot = state.history[newIndex];
        return {
          historyIndex: newIndex,
          style: snapshot.style,
          text: snapshot.text,
        };
      }
      return state;
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const snapshot = state.history[newIndex];
        return {
          historyIndex: newIndex,
          style: snapshot.style,
          text: snapshot.text,
        };
      }
      return state;
    }),

  // --------------------------------------------------------------------------
  // Fixed version of applyEnhancedStyle function
  // --------------------------------------------------------------------------
  applyEnhancedStyle: (styleId: string) => {
    const foundStyle = enhancedThumbnailStyles.find((s) => s.id === styleId);
    if (!foundStyle) return;

    // Convert the direction-based gradient to the store's angle-based style
    const bgAngle = directionToAngle(foundStyle.backgroundGradient.direction);

    // Convert text gradient direction if it exists
    let textGradientAngle = 0;
    if (foundStyle.textGradient?.direction) {
      textGradientAngle = directionToAngle(foundStyle.textGradient.direction);
    }

    // Build a partial style object that matches the store's fields
    const partialStyle: Partial<ThumbnailStyle> = {
      backgroundColor: foundStyle.backgroundColor,
      badgeStyle: foundStyle.badgeStyle,
      fontFamily: foundStyle.fontFamily,
      fontColor: foundStyle.fontColor,
      backgroundGradient: {
        enabled: foundStyle.backgroundGradient.enabled,
        type: "linear",
        colors: foundStyle.backgroundGradient.colors,
        angle: bgAngle,
      },
      fontShadow: {
        enabled: foundStyle.fontShadow.enabled,
        color: foundStyle.fontShadow.color,
        blur: foundStyle.fontShadow.blur,
        offsetX: foundStyle.fontShadow.offsetX,
        offsetY: foundStyle.fontShadow.offsetY,
      },
      fontOutlineWidth: foundStyle.fontOutlineWidth,
      fontOutlineColor: foundStyle.fontOutlineColor,
      // Add font sizes and weights
      fontSize: foundStyle.fontSize,
      fontWeight: foundStyle.fontWeight,
    };

    // Always add text gradient if it exists (don't make it conditional)
    if (foundStyle.textGradient) {
      partialStyle.textGradient = {
        enabled: foundStyle.textGradient.enabled,
        colors: foundStyle.textGradient.colors,
        direction: foundStyle.textGradient.direction,
        angle: textGradientAngle,
      };
    }

    // Always create headline and subtitle styles (don't make them conditional)
    // Headline style
    partialStyle.headlineStyle = {
      fontFamily: foundStyle.headlineStyle?.fontFamily || foundStyle.fontFamily,
      fontColor: foundStyle.headlineStyle?.fontColor || foundStyle.fontColor,
      fontWeight: foundStyle.headlineStyle?.fontWeight || foundStyle.fontWeight || 700,
    };

    // If there's a textGradient, apply it to headlineStyle
    if (foundStyle.textGradient || foundStyle.headlineStyle?.textGradient) {
      const gradientSource = foundStyle.headlineStyle?.textGradient || foundStyle.textGradient;
      if (gradientSource) {
        partialStyle.headlineStyle.textGradient = {
          enabled: gradientSource.enabled,
          colors: gradientSource.colors,
          direction: gradientSource.direction,
          angle: textGradientAngle,
        };
      }
    }

    // Subtitle style
    partialStyle.subtitleStyle = {
      fontFamily: foundStyle.subtitleStyle?.fontFamily || foundStyle.fontFamily,
      fontColor: foundStyle.subtitleStyle?.fontColor || foundStyle.fontColor,
      fontWeight: foundStyle.subtitleStyle?.fontWeight || 
                (foundStyle.fontWeight && foundStyle.fontWeight > 500 ? 
                 foundStyle.fontWeight - 200 : foundStyle.fontWeight) || 400,
    };

    // If there's a textGradient, apply it to subtitleStyle too
    if (foundStyle.textGradient || foundStyle.subtitleStyle?.textGradient) {
      const gradientSource = foundStyle.subtitleStyle?.textGradient || foundStyle.textGradient;
      if (gradientSource) {
        partialStyle.subtitleStyle.textGradient = {
          enabled: gradientSource.enabled,
          colors: gradientSource.colors,
          direction: gradientSource.direction,
          angle: textGradientAngle,
        };
      }
    }

    // Update the store with our modified partial style
    set((state) => ({
      style: {
        ...state.style,
        ...partialStyle,
      },
    }));
    
    // Also update text content for AR Dev Brand style
    if (styleId === "ar-dev-brand") {
      set((state) => ({
        text: {
          ...state.text,
          headline: "Decoding Twitter X",
          subtitle: "Secrets Unveiled"
        }
      }));
    }
  },
}));

export default useThumbnailStore;