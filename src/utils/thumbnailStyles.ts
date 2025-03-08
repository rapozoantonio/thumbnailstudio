const youtube2025ThumbnailStyles = [
  {
    id: "hyper-impact",
    name: "Hyper Impact",
    backgroundColor: "#000000",
    fontFamily: "Anton, sans-serif",
    fontColor: "#FFFFFF",
    backgroundGradient: {
      enabled: true,
      colors: ["#1A1A1A", "#000000"],
      direction: "to bottom",
      noiseOverlay: true,
      noiseOpacity: 0.12
    },
    fontShadow: {
      enabled: true,
      color: "#FF2D55",
      blur: 12,
      offsetX: 0,
      offsetY: 0,
      spread: 5
    },
    textGradient: {
      enabled: true,
      colors: ["#FFFFFF", "#F0F0F0"],
      direction: "to bottom",
      backgroundClip: "text",
      webkitBackgroundClip: "text",
    },
    fontOutlineWidth: 3,
    fontOutlineColor: "#FF2D55",
    headlineStyle: {
      fontFamily: "Anton, sans-serif",
      fontSize: 68,
      fontWeight: 900,
      letterSpacing: "-0.03em",
      textTransform: "uppercase",
      skew: "-5deg"
    },
    subtitleStyle: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 800,
      fontSize: 24,
      fontColor: "#FFFFFF",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    },
    emojiBadge: "🔥",
    badgeStyle: "floating-3d",
    animation: "pulse",
    preview: "/styles/hyper-impact-preview.png",
    description: "Maximum contrast with neon accents for high CTR",
    smartScaling: true
  },
  {
    id: "neo-tech",
    name: "Neo Tech",
    backgroundColor: "#0F0F1A",
    fontFamily: "Outfit, sans-serif",
    fontColor: "#FFFFFF",
    backgroundGradient: {
      enabled: true,
      colors: ["#0F0F1A", "#131429"],
      direction: "135deg",
      glassEffect: true,
      glassBlur: 10
    },
    fontShadow: {
      enabled: true,
      color: "#6366F1",
      blur: 18,
      offsetX: 0,
      offsetY: 0,
      spread: 0
    },
    textGradient: {
      enabled: true,
      colors: ["#FFFFFF", "#A5B4FC"],
      direction: "to right",
      backgroundClip: "text",
      webkitBackgroundClip: "text",
    },
    fontOutlineWidth: 0,
    headlineStyle: {
      fontFamily: "Outfit, sans-serif",
      fontSize: 64,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      textShadow: "0 0 15px rgba(99, 102, 241, 0.8)"
    },
    subtitleStyle: {
      fontFamily: "Inter, sans-serif",
      fontWeight: 600,
      fontSize: 22,
      fontColor: "#A5B4FC",
      letterSpacing: "0.02em"
    },
    emojiBadge: "✨",
    badgeStyle: "glass-card",
    animation: "float",
    preview: "/styles/neo-tech-preview.png",
    description: "Modern minimalist tech style with glass effects",
    smartScaling: true
  },
  {
    id: "ultra-contrast",
    name: "Ultra Contrast",
    backgroundColor: "#FFFFFF", // Changed to white background for true contrast
    fontFamily: "Sora, sans-serif",
    fontColor: "#000000", // Black text on white background
    backgroundGradient: {
      enabled: false
    },
    fontShadow: {
      enabled: false
    },
    textGradient: {
      enabled: false
    },
    fontOutlineWidth: 0,
    fontOutlineColor: "transparent",
    headlineStyle: {
      fontFamily: "Sora, sans-serif",
      fontSize: 72,
      fontWeight: 900,
      letterSpacing: "-0.04em",
      textTransform: "uppercase",
      lineHeight: 0.95
    },
    subtitleStyle: {
      fontFamily: "Sora, sans-serif",
      fontWeight: 700,
      fontSize: 24,
      fontColor: "#FF2D55", // Keeping the accent color for subtitle
      letterSpacing: "-0.01em"
    },
    highlightStyle: {
      backgroundColor: "#FF2D55",
      fontColor: "#FFFFFF",
      padding: "0.2em 0.4em",
      borderRadius: "0.1em"
    },
    emojiBadge: "👀",
    badgeStyle: "minimal",
    animation: "none",
    preview: "/styles/ultra-contrast-preview.png",
    description: "Extreme white/black contrast with minimal design",
    smartScaling: true
  },
  {
    id: "retro-future",
    name: "Retro Future",
    backgroundColor: "#0E0430",
    fontFamily: "Dela Gothic One, cursive",
    fontColor: "#FFFFFF",
    backgroundGradient: {
      enabled: true,
      colors: ["#0E0430", "#3A0CA3"],
      direction: "to bottom right",
      retroGrid: true
    },
    fontShadow: {
      enabled: true,
      color: "#F72585",
      blur: 15,
      offsetX: 4,
      offsetY: 4,
      spread: 0
    },
    textGradient: {
      enabled: true,
      colors: ["#4CC9F0", "#F72585"],
      direction: "to right",
      backgroundClip: "text",
      webkitBackgroundClip: "text",
    },
    fontOutlineWidth: 2,
    fontOutlineColor: "#F72585",
    headlineStyle: {
      fontFamily: "Dela Gothic One, cursive",
      fontSize: 66,
      fontWeight: 400,
      letterSpacing: "0.01em",
      textTransform: "uppercase"
    },
    subtitleStyle: {
      fontFamily: "Space Grotesk, sans-serif",
      fontWeight: 700,
      fontSize: 24,
      fontColor: "#4CC9F0",
      letterSpacing: "0.05em",
      textTransform: "uppercase"
    },
    emojiBadge: "🚀",
    badgeStyle: "retro-synth",
    animation: "glitch",
    preview: "/styles/retro-future-preview.png",
    description: "Synthwave/vaporwave aesthetic for gaming and tech",
    smartScaling: true
  },
  {
    id: "modern-organic",
    name: "Modern Organic",
    backgroundColor: "#F0EDE6",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontColor: "#1A1A1A",
    backgroundGradient: {
      enabled: true,
      colors: ["#F0EDE6", "#E5E1D9"],
      direction: "to bottom",
      organicTexture: true
    },
    fontShadow: {
      enabled: false
    },
    textGradient: {
      enabled: false
    },
    fontOutlineWidth: 0,
    headlineStyle: {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 64,
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1.1,
      color: "#1A1A1A"
    },
    subtitleStyle: {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontWeight: 600,
      fontSize: 22,
      fontColor: "#3D3D3D",
      letterSpacing: "0"
    },
    highlightStyle: {
      backgroundColor: "#CEA878",
      fontColor: "#FFFFFF",
      padding: "0.1em 0.4em",
      borderRadius: "0.2em"
    },
    emojiBadge: "🌿",
    badgeStyle: "organic-pill",
    animation: "none",
    preview: "/styles/modern-organic-preview.png",
    description: "Minimal organic style for lifestyle and wellness",
    smartScaling: true
  },
  {
    id: "augmented-reality",
    name: "Augmented Reality",
    backgroundColor: "#000000",
    fontFamily: "Chakra Petch, sans-serif",
    fontColor: "#FFFFFF",
    backgroundGradient: {
      enabled: true,
      colors: ["#000000", "#0D0D0D"],
      direction: "to bottom",
      holographicEffect: true
    },
    fontShadow: {
      enabled: true,
      color: "#00F0FF",
      blur: 10,
      offsetX: 0,
      offsetY: 0,
      spread: 5
    },
    textGradient: {
      enabled: true,
      colors: ["#00F0FF", "#7B61FF"],
      direction: "to right",
      backgroundClip: "text",
      webkitBackgroundClip: "text",
    },
    fontOutlineWidth: 1,
    fontOutlineColor: "#00F0FF",
    headlineStyle: {
      fontFamily: "Chakra Petch, sans-serif",
      fontSize: 62,
      fontWeight: 700,
      letterSpacing: "0.02em",
      textTransform: "uppercase"
    },
    subtitleStyle: {
      fontFamily: "Chakra Petch, sans-serif",
      fontWeight: 600,
      fontSize: 22,
      fontColor: "#FFFFFF",
      letterSpacing: "0.1em",
      textTransform: "uppercase"
    },
    emojiBadge: "👁️",
    badgeStyle: "holographic",
    animation: "scan-lines",
    preview: "/styles/augmented-reality-preview.png",
    description: "Futuristic AR/VR aesthetic with holographic elements",
    smartScaling: true
  },
  {
    id: "viral-shock",
    name: "Viral Shock",
    backgroundColor: "#FF3131",
    fontFamily: "Bebas Neue, sans-serif",
    fontColor: "#FFFFFF",
    backgroundGradient: {
      enabled: true,
      colors: ["#FF3131", "#FF0000"],
      direction: "to bottom",
      noiseOverlay: true,
      noiseOpacity: 0.15
    },
    fontShadow: {
      enabled: true,
      color: "#000000",
      blur: 2,
      offsetX: 4,
      offsetY: 4,
      spread: 0
    },
    textGradient: {
      enabled: false
    },
    fontOutlineWidth: 3,
    fontOutlineColor: "#000000",
    headlineStyle: {
      fontFamily: "Bebas Neue, sans-serif",
      fontSize: 78,
      fontWeight: 400,
      letterSpacing: "0.01em",
      textTransform: "uppercase",
      lineHeight: 0.9
    },
    subtitleStyle: {
      fontFamily: "Archivo Black, sans-serif",
      fontWeight: 400,
      fontSize: 26,
      fontColor: "#FFFFFF",
      letterSpacing: "0.01em",
      textTransform: "uppercase"
    },
    emojiBadge: "⚠️",
    badgeStyle: "alert",
    animation: "bounce",
    preview: "/styles/viral-shock-preview.png",
    description: "Extreme attention-grabbing style for viral content",
    smartScaling: true
  },
  {
    id: "ai-future",
    name: "AI Future",
    backgroundColor: "#121212",
    fontFamily: "Satoshi, sans-serif",
    fontColor: "#FFFFFF",
    backgroundGradient: {
      enabled: true,
      colors: ["#121212", "#1E1E1E"],
      direction: "to bottom",
      aiPatternOverlay: true
    },
    fontShadow: {
      enabled: true,
      color: "#6C5CE7",
      blur: 20,
      offsetX: 0,
      offsetY: 0,
      spread: 0
    },
    textGradient: {
      enabled: true,
      colors: ["#FFFFFF", "#D8D8D8"],
      direction: "to bottom",
      backgroundClip: "text",
      webkitBackgroundClip: "text",
    },
    fontOutlineWidth: 0,
    headlineStyle: {
      fontFamily: "Satoshi, sans-serif",
      fontSize: 65,
      fontWeight: 900,
      letterSpacing: "-0.03em"
    },
    subtitleStyle: {
      fontFamily: "Satoshi, sans-serif",
      fontWeight: 500,
      fontSize: 22,
      fontColor: "#A29BFE",
      letterSpacing: "0.02em"
    },
    accentStyle: {
      fontFamily: "Satoshi, sans-serif",
      fontWeight: 700,
      color: "#6C5CE7"
    },
    emojiBadge: "🤖",
    badgeStyle: "ai-pulse",
    animation: "typing",
    preview: "/styles/ai-future-preview.png",
    description: "Clean, sophisticated AI-themed style for tech content",
    smartScaling: true
  },
  {
    id: "ar-dev-brand",
    name: "AR Dev Brand",
    backgroundColor: "#000",
    fontFamily: "Poppins, sans-serif",
    fontColor: "#fefffe",
    backgroundGradient: {
      enabled: true,
      colors: ["#0A192F", "#000000"],
      direction: "to bottom",
      glassEffect: true,
      glassBlur: 5
    },
    fontShadow: {
      enabled: false
    },
    textGradient: {
      enabled: true,
      colors: ["#12a480", "#7ff8cf"],
      direction: "to right",
      backgroundClip: "text",
      webkitBackgroundClip: "text"
    },
    fontOutlineWidth: 0,
    fontOutlineColor: "transparent",
    headlineStyle: {
      fontFamily: "Poppins, sans-serif",
      fontSize: 64,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      textGradient: {
        enabled: true,
        colors: ["#12a480", "#7ff8cf"],
        direction: "to right",
        backgroundClip: "text",
        webkitBackgroundClip: "text"
      }
    },
    subtitleStyle: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 500,
      fontSize: 24,
      textGradient: {
        enabled: true,
        colors: ["#12a480", "#7ff8cf", "#12a480"],
        direction: "to right",
        backgroundClip: "text",
        webkitBackgroundClip: "text"
      }
    },
    emojiBadge: "🔮",
    badgeStyle: "floating",
    animation: "fade-in",
    preview: "/styles/ar-dev-brand-preview.png",
    description: "Professional developer brand with teal gradients",
    smartScaling: true
  }
];

// Responsive utilities for thumbnail adaptation
const responsiveUtils = {
  // Dynamically adjusts font size based on text length and container width
  smartTextScaling: (text, containerWidth, baseSize) => {
    if (!text) return baseSize;
    const length = text.length;
    const multiplier = Math.max(0.6, 1 - (length * 0.01));
    return Math.round(baseSize * multiplier);
  },
  
  // Creates accessibility contrast variants of styles
  generateAccessibleVariant: (style) => {
    const accessibleStyle = {...style};
    accessibleStyle.id = `${style.id}-accessible`;
    accessibleStyle.name = `${style.name} (Accessible)`;
    
    // Simple reliable check for light backgrounds by hex code
    const bgColor = style.backgroundColor || "#000000";
    
    // Convert hex to RGB to determine brightness
    let r = 0, g = 0, b = 0;
    if (bgColor.length === 7) {
      r = parseInt(bgColor.substring(1, 3), 16);
      g = parseInt(bgColor.substring(3, 5), 16);
      b = parseInt(bgColor.substring(5, 7), 16);
    }
    
    // Calculate perceived brightness using the formula: (0.299*R + 0.587*G + 0.114*B)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
    const isLightBackground = brightness > 128;
    
    // Apply appropriate contrasting colors based on background brightness
    if (isLightBackground) {
      // For light backgrounds (like white), use black text
      accessibleStyle.fontColor = "#000000";
      accessibleStyle.fontOutlineWidth = Math.max(2, style.fontOutlineWidth);
      accessibleStyle.fontOutlineColor = "#333333";
      accessibleStyle.fontShadow = {
        enabled: true,
        color: "#666666",
        blur: 8,
        offsetX: 2,
        offsetY: 2,
        spread: 0
      };
    } else {
      // For dark backgrounds, use white text
      accessibleStyle.fontColor = "#FFFFFF";
      accessibleStyle.fontOutlineWidth = Math.max(2, style.fontOutlineWidth);
      accessibleStyle.fontOutlineColor = "#000000";
      accessibleStyle.fontShadow = {
        enabled: true,
        color: "#000000",
        blur: 8,
        offsetX: 2,
        offsetY: 2,
        spread: 0
      };
    }
    
    // If there's a headline style, ensure it also has proper contrast
    if (accessibleStyle.headlineStyle) {
      accessibleStyle.headlineStyle.color = accessibleStyle.fontColor;
    }
    
    // Disable text gradients for accessibility
    accessibleStyle.textGradient = { enabled: false };
    
    return accessibleStyle;
  },
  
  // Mobile-optimized variants with larger text and simplified effects
  generateMobileVariant: (style) => {
    const mobileStyle = {...style};
    mobileStyle.id = `${style.id}-mobile`;
    mobileStyle.name = `${style.name} (Mobile)`;
    
    // Increase font size and reduce effects for mobile visibility
    if (mobileStyle.headlineStyle) {
      mobileStyle.headlineStyle.fontSize = Math.min(72, style.headlineStyle.fontSize * 1.2);
    }
    
    // Simplify background for performance
    if (mobileStyle.backgroundGradient && mobileStyle.backgroundGradient.enabled) {
      mobileStyle.backgroundGradient.noiseOverlay = false;
      mobileStyle.backgroundGradient.retroGrid = false;
      mobileStyle.backgroundGradient.holographicEffect = false;
    }
    
    return mobileStyle;
  }
};

// Generate all variants
const generateAllVariants = () => {
  const allStyles = [...youtube2025ThumbnailStyles];
  
  // Add accessible and mobile variants
  youtube2025ThumbnailStyles.forEach(style => {
    if (style.smartScaling) {
      allStyles.push(responsiveUtils.generateAccessibleVariant(style));
      allStyles.push(responsiveUtils.generateMobileVariant(style));
    }
  });
  
  return allStyles;
};

export const allThumbnailStyles = generateAllVariants();
export default youtube2025ThumbnailStyles;