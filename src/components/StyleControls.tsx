// src/components/StyleControls.tsx
import React, { useState } from "react";
import useThumbnailStore from "../store/thumbnailStore";
import AssetLibrary from "./AssetLibrary";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Palette as PaletteIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import enhancedThumbnailStyles from "../utils/thumbnailStyles.js";
import sampleAssets from "../utils/sampleAssets.js";

// Drawer width configuration
const drawerWidth = 280;
const drawerCollapsedWidth = 60;

// Custom styled components
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth - drawerCollapsedWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  width: open ? drawerWidth : drawerCollapsedWidth,
  flexShrink: 0,
  overflowX: "hidden",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : drawerCollapsedWidth,
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: "#1F2937", // Dark background
    color: "#FFFFFF",
    borderRight: "1px solid #374151",
  },
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  minHeight: 64,
  justifyContent: "flex-end",
}));

const ContentPanel = styled(Box)(({ theme }) => ({
  backgroundColor: "#111827",
  borderTopLeftRadius: theme.shape.borderRadius,
  borderBottomLeftRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  height: "calc(100% - 120px)", // Account for header and navigation
  overflowY: "auto",
  marginTop: theme.spacing(1),
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const StylePreview = styled(Box)(({ theme, style }) => ({
  height: 160,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  position: "relative",
  background: style.backgroundGradient?.enabled
    ? `linear-gradient(${style.backgroundGradient.direction || "to bottom"}, ${style.backgroundGradient.colors[0]}, ${
        style.backgroundGradient.colors[1]
      })`
    : style.backgroundColor,
}));

// Wrapper for AssetLibrary to apply Material-UI styling
const StyledAssetLibraryWrapper = styled(Box)(({ theme }) => ({
  "& input[type='text'], & select": {
    backgroundColor: "#374151",
    border: "1px solid #4B5563",
    color: "#FFFFFF",
    borderRadius: theme.shape.borderRadius,
    padding: "8px 12px",
    fontSize: "0.875rem",
    width: "100%",
    marginBottom: "8px",
    outline: "none",
    "&:focus": {
      borderColor: "#3B82F6",
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
    },
  },
  "& button": {
    backgroundColor: "#374151",
    color: "rgba(255, 255, 255, 0.7)",
    borderRadius: "9999px",
    padding: "4px 10px",
    fontSize: "0.75rem",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    marginRight: "8px",
    marginBottom: "8px",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#4B5563",
      color: "#FFFFFF",
    },
    "&.active": {
      backgroundColor: "#3B82F6",
      color: "#FFFFFF",
    },
  },
  "& .asset-grid": {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
    marginTop: "12px",
    maxHeight: "300px",
    overflowY: "auto",
    padding: "4px",
  },
  "& .asset-item": {
    backgroundColor: "#374151",
    borderRadius: theme.shape.borderRadius,
    padding: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "center",
    "&:hover": {
      backgroundColor: "#4B5563",
    },
  },
  "& .asset-name": {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

const StyleControls = () => {
  // Add updateText to the destructured values from the store
  const { style, updateStyle, updateText, addAsset, removeAsset } = useThumbnailStore();
  const [open, setOpen] = useState(true);
  const [activeSection, setActiveSection] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
    // If we're collapsing and there's an active section, hide it
    if (open && activeSection) {
      setActiveSection(null);
    }
  };

  const handleSectionChange = (section) => {
    // If already active, toggle off
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      // If drawer is closed and we're showing a section, open the drawer
      if (!open) {
        setOpen(true);
      }
    }
  };

  const closeSection = () => {
    setActiveSection(null);
  };

  const applyThumbnailStyle = (styleId) => {
    const selectedStyle = enhancedThumbnailStyles.find((s) => s.id === styleId);
    if (!selectedStyle) return;
  
    // First, capture current text positions to preserve them
    const { text: currentText } = useThumbnailStore.getState();
    const currentHeadlinePosition = currentText.headlineCustomPosition;
    const currentSubtitlePosition = currentText.subtitleCustomPosition;
  
    // Use updated titles for AR Dev Brand
    const defaultTitle =
      styleId === "matrix"
        ? "LEARN REACT"
        : styleId === "terminal"
        ? "$ npm start"
        : styleId === "high-impact"
        ? "REDUX MASTERY"
        : styleId === "dark-code"
        ? "TypeScript Tips"
        : styleId === "purple-creative"
        ? "React Hooks"
        : styleId === "green-success"
        ? "Node.js Guide"
        : styleId === "modern-tech"
        ? "API Design"
        : styleId === "ar-dev-brand"
        ? "Decoding"
        : "Custom Title";
  
    const defaultSubtitle =
      styleId === "matrix"
        ? "Advanced Techniques"
        : styleId === "terminal"
        ? "Starting a project"
        : styleId === "high-impact"
        ? "State Management"
        : styleId === "dark-code"
        ? "Top 5 Tricks"
        : styleId === "purple-creative"
        ? "useEffect Explained"
        : styleId === "green-success"
        ? "Performance Tuning"
        : styleId === "modern-tech"
        ? "REST vs GraphQL"
        : styleId === "ar-dev-brand"
        ? "Secrets Unveiled"
        : "Your subtitle here";
  
    // Create the complete style update object
    const styleUpdate = {
      backgroundColor: selectedStyle.backgroundColor,
      fontFamily: selectedStyle.fontFamily,
      fontColor: selectedStyle.fontColor,
      backgroundGradient: selectedStyle.backgroundGradient,
      fontShadow: selectedStyle.fontShadow,
      fontOutlineWidth: selectedStyle.fontOutlineWidth,
      fontOutlineColor: selectedStyle.fontOutlineColor,
      badgeStyle: selectedStyle.badgeStyle,
      fontWeight: selectedStyle.fontWeight,
      fontSize: selectedStyle.fontSize,
    };
  
    // Add text gradient if it exists in the style
    if (selectedStyle.textGradient) {
      styleUpdate.textGradient = selectedStyle.textGradient;
    }
    
    // Add headline style if it exists
    if (selectedStyle.headlineStyle) {
      styleUpdate.headlineStyle = selectedStyle.headlineStyle;
    }
    
    // Add subtitle style if it exists
    if (selectedStyle.subtitleStyle) {
      styleUpdate.subtitleStyle = selectedStyle.subtitleStyle;
    }
  
    // First update the style
    updateStyle(styleUpdate);
    
    // Then update the text, PRESERVING the custom positions
    updateText({
      headline: defaultTitle,
      subtitle: defaultSubtitle,
      // Preserve existing positions if they exist, otherwise use default
      headlineCustomPosition: currentHeadlinePosition || null,
      subtitleCustomPosition: currentSubtitlePosition || null,
    });
    
    // Log for debugging
    console.log("Applied style:", styleId);
    console.log("Preserved headline position:", currentHeadlinePosition);
    console.log("Preserved subtitle position:", currentSubtitlePosition);
  };

  // Handler for selecting an asset from AssetLibrary
  const handleAssetSelect = (asset) => {
    // Calculate sensible default position for new assets
    let defaultX, defaultY;
    
    // Position based on alignment preference
    if (asset.position === 'left') {
      defaultX = 200;
    } else if (asset.position === 'right') {
      defaultX = 800;
    } else { // center
      defaultX = 500;
    }
    
    // Add new asset to the store
    addAsset({
      src: asset.src,
      type: asset.type,
      position: asset.position,
      x: defaultX,
      y: 300, // vertical center
      width: asset.type === 'icon' ? 200 : 400, // smaller for icons
      height: asset.type === 'icon' ? 200 : 400,
      rotation: 0,
      opacity: 1,
      zIndex: style.assets.length + 1,
    });
    
    // Show the selected assets section
    setActiveSection("assets");
  };

  // Helper to render correct text for each style
  const getTitleForStyle = (styleId) => {
    return styleId === "matrix"
      ? "LEARN REACT"
      : styleId === "terminal"
      ? "$ npm start"
      : styleId === "high-impact"
      ? "REDUX MASTERY"
      : styleId === "dark-code"
      ? "TypeScript Tips"
      : styleId === "purple-creative"
      ? "React Hooks"
      : styleId === "green-success"
      ? "Node.js Guide"
      : styleId === "modern-tech"
      ? "API Design"
      : styleId === "ar-dev-brand"
      ? "Decoding"
      : "Custom Title";
  };

  const getSubtitleForStyle = (styleId) => {
    return styleId === "ar-dev-brand"
      ? "Secrets Unveiled"
      : styleId === "matrix"
      ? "Advanced Techniques"
      : styleId === "terminal"
      ? "Starting a project"
      : styleId === "high-impact"
      ? "State Management"
      : styleId === "dark-code"
      ? "Top 5 Tricks"
      : styleId === "purple-creative"
      ? "useEffect Explained"
      : styleId === "green-success"
      ? "Performance Tuning"
      : styleId === "modern-tech"
      ? "REST vs GraphQL"
      : "Your subtitle here";
  };

  const renderBadge = (style) => {
    if (!style.badgeStyle || style.badgeStyle === "none") return null;

    const badgeStyles = {
      position: "absolute",
      fontSize: "0.7rem",
      padding: "2px 8px",
      borderRadius: style.badgeStyle === "pill" ? "9999px" : "4px",
      backgroundColor:
        style.badgeStyle === "pill"
          ? "rgba(79, 70, 229, 0.8)"
          : style.badgeStyle === "rectangle"
          ? "rgba(239, 68, 68, 0.9)"
          : style.badgeStyle === "code"
          ? "rgba(31, 41, 55, 0.7)"
          : style.badgeStyle === "floating"
          ? "rgba(34, 197, 94, 0.9)"
          : "rgba(31, 41, 55, 0.9)",
      ...(style.badgeStyle === "pill"
        ? { top: "8px", right: "8px" }
        : style.badgeStyle === "rectangle"
        ? { top: "8px", left: "8px" }
        : style.badgeStyle === "code"
        ? { bottom: "8px", left: "8px", fontFamily: "monospace" }
        : style.badgeStyle === "floating"
        ? { bottom: "8px", right: "8px" }
        : { bottom: "8px", left: "8px" }),
    };

    return <Box sx={badgeStyles}>Code</Box>;
  };

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <StyledDrawer variant="permanent" open={open} anchor="left">
        <DrawerHeader>
          {open && (
            <Typography variant="h6" sx={{ flexGrow: 1, pl: 2 }}>
              Style
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ backgroundColor: "#374151" }} />
        <List>
          <ListItem
            button
            onClick={() => handleSectionChange("templates")}
            selected={activeSection === "templates"}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              "&.Mui-selected": {
                backgroundColor: "#3B82F6",
              },
              "&.Mui-selected:hover": {
                backgroundColor: "#2563EB",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                justifyContent: "center",
                color: activeSection === "templates" ? "white" : "rgba(255, 255, 255, 0.7)",
              }}
            >
              <PaletteIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Templates" />}
          </ListItem>
          <ListItem
            button
            onClick={() => handleSectionChange("assets")}
            selected={activeSection === "assets"}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              "&.Mui-selected": {
                backgroundColor: "#3B82F6",
              },
              "&.Mui-selected:hover": {
                backgroundColor: "#2563EB",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                justifyContent: "center",
                color: activeSection === "assets" ? "white" : "rgba(255, 255, 255, 0.7)",
              }}
            >
              <ImageIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Assets" />}
          </ListItem>
        </List>

        {/* Content panels - only visible when a section is active AND drawer is open */}
        {open && activeSection && (
          <ContentPanel>
            <PanelHeader>
              <Typography variant="h6">{activeSection === "templates" ? "Templates" : "Assets"}</Typography>
              <IconButton size="small" onClick={closeSection} sx={{ color: "white" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </PanelHeader>

            {/* Templates Content */}
            {activeSection === "templates" && (
              <Grid container spacing={2}>
                {enhancedThumbnailStyles.map((thumbnailStyle) => (
                  <Grid item xs={12} key={thumbnailStyle.id}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        bgcolor: "#1F2937",
                        color: "white",
                        "&:hover": {
                          boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)",
                          transform: "scale(1.02)",
                          transition: "all 0.2s ease-in-out",
                        },
                      }}
                      onClick={() => applyThumbnailStyle(thumbnailStyle.id)}
                    >
                      <StylePreview style={thumbnailStyle}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {/* Headline with gradient text support */}
                          <Typography
                            variant="h6"
                            align="center"
                            sx={{
                              fontFamily: thumbnailStyle.headlineStyle?.fontFamily || thumbnailStyle.fontFamily,
                              fontWeight: thumbnailStyle.headlineStyle?.fontWeight || thumbnailStyle.fontWeight || 700,
                              fontSize: thumbnailStyle.fontSize ? `${thumbnailStyle.fontSize}px` : "inherit",
                              ...(thumbnailStyle.headlineStyle?.textGradient?.enabled || thumbnailStyle.textGradient?.enabled
                                ? {
                                    background: `linear-gradient(to right, ${
                                      thumbnailStyle.headlineStyle?.textGradient?.colors?.[0] ||
                                      thumbnailStyle.textGradient?.colors?.[0] ||
                                      "#FFFFFF"
                                    }, ${
                                      thumbnailStyle.headlineStyle?.textGradient?.colors?.[1] ||
                                      thumbnailStyle.textGradient?.colors?.[1] ||
                                      "#FFFFFF"
                                    })`,
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    color: "transparent", // Fallback
                                  }
                                : {
                                    color: thumbnailStyle.headlineStyle?.fontColor || thumbnailStyle.fontColor,
                                  }),
                              textShadow: thumbnailStyle.fontShadow?.enabled
                                ? `${thumbnailStyle.fontShadow.offsetX}px ${thumbnailStyle.fontShadow.offsetY}px ${thumbnailStyle.fontShadow.blur}px ${thumbnailStyle.fontShadow.color}`
                                : "none",
                              WebkitTextStroke:
                                thumbnailStyle.fontOutlineWidth > 0
                                  ? `${thumbnailStyle.fontOutlineWidth}px ${thumbnailStyle.fontOutlineColor}`
                                  : "none",
                            }}
                          >
                            {getTitleForStyle(thumbnailStyle.id)}
                          </Typography>

                          {/* Subtitle with its own styling */}
                          <Typography
                            variant="subtitle1"
                            align="center"
                            sx={{
                              fontFamily: thumbnailStyle.subtitleStyle?.fontFamily || thumbnailStyle.fontFamily,
                              fontWeight: thumbnailStyle.subtitleStyle?.fontWeight || 400,
                              fontSize: thumbnailStyle.subtitleFontSize ? `${thumbnailStyle.subtitleFontSize}px` : "0.8rem",
                              ...(thumbnailStyle.subtitleStyle?.textGradient?.enabled || thumbnailStyle.textGradient?.enabled
                                ? {
                                    background: `linear-gradient(to right, ${
                                      thumbnailStyle.subtitleStyle?.textGradient?.colors?.[0] ||
                                      thumbnailStyle.textGradient?.colors?.[0] ||
                                      "#FFFFFF"
                                    }, ${
                                      thumbnailStyle.subtitleStyle?.textGradient?.colors?.[1] ||
                                      thumbnailStyle.textGradient?.colors?.[1] ||
                                      "#FFFFFF"
                                    })`,
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    color: "transparent", // Fallback
                                  }
                                : {
                                    color: thumbnailStyle.subtitleStyle?.fontColor || thumbnailStyle.fontColor,
                                  }),
                              textShadow: thumbnailStyle.fontShadow?.enabled
                                ? `${thumbnailStyle.fontShadow.offsetX}px ${thumbnailStyle.fontShadow.offsetY}px ${thumbnailStyle.fontShadow.blur}px ${thumbnailStyle.fontShadow.color}`
                                : "none",
                            }}
                          >
                            {getSubtitleForStyle(thumbnailStyle.id)}
                          </Typography>
                        </Box>
                        {renderBadge(thumbnailStyle)}
                      </StylePreview>
                      <CardContent>
                        <Typography variant="body1" gutterBottom>
                          {thumbnailStyle.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                          {thumbnailStyle.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Assets Content - Now using AssetLibrary component */}
            {activeSection === "assets" && (
              <Box>
                {/* Asset Library Component */}
                <StyledAssetLibraryWrapper>
                  <AssetLibrary
                    assets={sampleAssets}
                    onSelect={handleAssetSelect}
                  />
                </StyledAssetLibraryWrapper>

                {/* Selected Assets List */}
                {style.assets.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Selected Assets
                    </Typography>
                    <Paper sx={{ bgcolor: "#1F2937", color: "white" }}>
                      <List>
                        {style.assets.map((asset) => (
                          <ListItem
                            key={asset.id}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => removeAsset(asset.id)}
                                sx={{ color: "#EF4444" }}
                              >
                                <CloseIcon />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <Avatar src={asset.src} alt="Asset" sx={{ width: 32, height: 32 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${asset.position.charAt(0).toUpperCase() + asset.position.slice(1)} Aligned`}
                              secondary={asset.type || "Image"}
                              sx={{ 
                                '& .MuiListItemText-primary': { color: "rgba(255, 255, 255, 0.9)" },
                                '& .MuiListItemText-secondary': { color: "rgba(255, 255, 255, 0.6)" }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
          </ContentPanel>
        )}
      </StyledDrawer>

      {/* This is the main content area, kept for structure but not used in this component */}
      <Main open={open} sx={{ height: "100%", overflow: "auto", p: 2, backgroundColor: "#111827" }}>
        {/* Main content will be placed in App.tsx */}
      </Main>
    </Box>
  );
};

export default StyleControls;