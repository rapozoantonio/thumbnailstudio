// src/components/VariationControls.tsx - Updated to handle custom positions
import React, { useEffect, useRef, useState } from "react";
import useThumbnailStore from "../store/thumbnailStore";
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Divider,
  Grid,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Remove as RemoveIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// Drawer width configuration
const drawerWidth = 280;
const drawerCollapsedWidth = 60;

// Custom styled components
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
    backgroundColor: "#1F2937",
    color: "#FFFFFF",
    borderLeft: "1px solid #374151",
    height: "100%",
    position: "relative",
  },
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  minHeight: 64,
  justifyContent: "flex-start",
}));

const ContentPanel = styled(Box)(({ theme }) => ({
  backgroundColor: "#111827",
  borderTopRightRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  height: "calc(100% - 120px)",
  overflowY: "auto",
  marginTop: theme.spacing(1),
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
}));

const AlignmentButton = styled(Button)(({ theme, active }) => ({
  padding: theme.spacing(1),
  backgroundColor: active ? "rgba(59, 130, 246, 0.2)" : "#1F2937",
  border: active ? "1px solid #3B82F6" : "1px solid transparent",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minWidth: "auto",
  "&:hover": {
    backgroundColor: active ? "rgba(59, 130, 246, 0.3)" : "#374151",
  },
}));

const VariationItem = styled(Paper)(({ theme, active }) => ({
  position: "relative",
  aspectRatio: "1/1",
  cursor: "pointer",
  backgroundColor: "#1F2937",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  border: active ? "2px solid #3B82F6" : "none",
  opacity: active ? 1 : 0.75,
  "&:hover": {
    opacity: 1,
  },
}));

const VariationControls = () => {
  const {
    canvasWidth,
    canvasHeight,
    variations,
    selectedVariationId,
    generateVariations,
    selectVariation,
    updateText,
    updateStyle,
    style,
    text,
  } = useThumbnailStore();

  const styleRef = useRef(style);
  const textRef = useRef(text);
  const [assetsChanged, setAssetsChanged] = useState(false);
  const [open, setOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("layout");

  useEffect(() => {
    const prevAssetCount = styleRef.current?.assets?.length || 0;
    const currentAssetCount = style?.assets?.length || 0;
    if (prevAssetCount !== currentAssetCount) {
      setAssetsChanged(true);
    }
    styleRef.current = style;
  }, [style]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (variations.length === 0) {
      generateVariations();
    } else if (variations.length > 0 && !selectedVariationId) {
      handleVariationSelect(variations[0].id);
    }
  }, [variations.length, selectedVariationId]);

  // Helper function to calculate standard positions based on vertical position setting
  const calculateStandardPositions = (position) => {
    // Canvas dimensions
    const width = canvasWidth || 1280;
    const height = canvasHeight || 720;

    // Calculate headline position
    let headlineY;
    if (position === "top") headlineY = 100;
    else if (position === "bottom") headlineY = height - 150;
    else headlineY = height / 2; // "middle"

    // Calculate subtitle position (40px below headline)
    const subtitleY = headlineY + 40;

    return {
      headlineY,
      subtitleY,
    };
  };

  const computeOptimizedAlignment = (assets = []) => {
    let leftCount = 0,
      rightCount = 0;
    assets.forEach((asset) => {
      if (asset.position === "left") leftCount++;
      else if (asset.position === "right") rightCount++;
    });
    if (leftCount > rightCount) return { headlineAlignment: "right", subtitleAlignment: "right" };
    if (rightCount > leftCount) return { headlineAlignment: "left", subtitleAlignment: "left" };
    return { headlineAlignment: "center", subtitleAlignment: "center" };
  };

  const applySelectedVariation = (variationId) => {
    const variation = variations.find((v) => v.id === variationId);
    if (variation) {
      const optimizedAlignment = computeOptimizedAlignment(variation.style.assets);

      // Determine the headline and subtitle positions
      const position = variation.text.headlinePosition || textRef.current.headlinePosition || "middle";
      const standardPositions = calculateStandardPositions(position);

      // Prepare style update
      const newStyle = {
        ...styleRef.current,
        ...variation.style,
        assets:
          variation.style.assets?.length > 0
            ? variation.style.assets.map((asset) => ({ ...asset }))
            : styleRef.current.assets || [],
      };

      // Prepare text update with RESET custom positions to use standard positions
      const newText = {
        ...textRef.current,
        ...variation.text,
        headlineAlignment: optimizedAlignment.headlineAlignment,
        subtitleAlignment: optimizedAlignment.subtitleAlignment,
        headlinePosition: position,
        subtitlePosition: position,
        // Reset custom positions when applying variation
        headlineCustomPosition: null,
        subtitleCustomPosition: null,
      };

      // Update store
      updateStyle(newStyle);
      updateText(newText);
    }
  };

  const handleVariationSelect = (id) => {
    selectVariation(id);
    applySelectedVariation(id);
    setAssetsChanged(false);
  };

  const handleRegenerateVariations = () => {
    const currentStyleBackup = { ...style };
    const currentTextBackup = { ...text };
    generateVariations();
    setAssetsChanged(false);
    setTimeout(() => {
      variations.length > 0
        ? handleVariationSelect(variations[0].id)
        : (updateStyle(currentStyleBackup), updateText(currentTextBackup));
    }, 100);
  };

  // Updated to reset custom positions when applying standard alignment
  const applyLayoutPatternHorizontal = (alignment) => {
    // Save current vertical position
    const currentPosition = text.headlinePosition;
    const standardPositions = calculateStandardPositions(currentPosition);

    // Calculate horizontal positions based on alignment
    const width = canvasWidth || 1280;
    let headlineX, subtitleX;

    if (alignment === "left") {
      headlineX = 100;
      subtitleX = 100;
    } else if (alignment === "right") {
      headlineX = width - 100;
      subtitleX = width - 100;
    } else {
      // center
      headlineX = width / 2;
      subtitleX = width / 2;
    }

    updateText({
      ...text,
      headlineAlignment: alignment,
      subtitleAlignment: alignment,
      // Reset custom positions to use standard positions
      headlineCustomPosition: null,
      subtitleCustomPosition: null,
    });

    setAssetsChanged(false);

    // Log for debugging
    console.log(`Applied horizontal alignment: ${alignment}, reset custom positions`);
  };

  // Updated to reset custom positions when applying standard position
  const applyLayoutPatternVertical = (position) => {
    // Calculate standard positions based on the selected position
    const standardPositions = calculateStandardPositions(position);

    updateText({
      ...text,
      headlinePosition: position,
      subtitlePosition: position,
      // Reset custom positions to use standard positions
      headlineCustomPosition: null,
      subtitleCustomPosition: null,
    });

    setAssetsChanged(false);

    // Log for debugging
    console.log(`Applied vertical position: ${position}, reset custom positions`);
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
    if (open && activeSection) {
      setActiveSection(null);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(activeSection === section ? null : section);
    if (!open) setOpen(true);
  };

  const closeSection = () => {
    setActiveSection(null);
  };

  if (variations.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 100,
          bgcolor: "rgba(31, 41, 55, 0.5)",
          borderRadius: 2,
        }}
      >
        <RefreshIcon sx={{ animation: "spin 2s linear infinite", color: "#3B82F6" }} />
        <Typography variant="caption" sx={{ mt: 1, color: "text.secondary" }}>
          Generating variations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <StyledDrawer variant="permanent" open={open} anchor="right">
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
            {open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
          {open && (
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Layout
            </Typography>
          )}
        </DrawerHeader>
        <Divider sx={{ backgroundColor: "#374151" }} />

        {!open ? (
          <List sx={{ pt: 0 }}>
            <ListItem
              button
              onClick={() => handleSectionChange("layout")}
              sx={{
                minHeight: 48,
                justifyContent: "center",
                px: 2.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, justifyContent: "center" }}>
                <DashboardIcon />
              </ListItemIcon>
            </ListItem>
          </List>
        ) : (
          <>
            <List>
              <ListItem
                button
                onClick={() => handleSectionChange("layout")}
                selected={activeSection === "layout"}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  "&.Mui-selected": {
                    backgroundColor: "#3B82F6",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "#2563EB",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2, color: "inherit" }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Options" />
              </ListItem>
            </List>

            {activeSection && (
              <ContentPanel>
                <PanelHeader>
                  <Typography variant="h6">Options</Typography>
                  <IconButton size="small" onClick={closeSection}>
                    <CloseIcon fontSize="small" sx={{ color: "white" }} />
                  </IconButton>
                </PanelHeader>

                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Button
                      startIcon={<RefreshIcon />}
                      onClick={handleRegenerateVariations}
                      variant="text"
                      size="small"
                      fullWidth
                      sx={{
                        bgcolor: "rgba(59, 130, 246, 0.2)",
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(59, 130, 246, 0.3)",
                        },
                        fontSize: "0.75rem",
                        py: 0.5,
                        px: 1,
                      }}
                    >
                      Refresh
                    </Button>
                  </Box>

                  {/* Show custom position status */}
                  {(text.headlineCustomPosition || text.subtitleCustomPosition) && (
                    <Box
                      sx={{
                        mb: 2,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: "rgba(59, 130, 246, 0.1)",
                        border: "1px dashed rgba(59, 130, 246, 0.5)",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        <em>Custom positioning active</em>
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ mb: 1, color: "rgba(255, 255, 255, 0.7)" }}>
                    Text Alignment
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 3 }}>
                    {[
                      { value: "left", icon: <AlignLeftIcon /> },
                      { value: "center", icon: <AlignCenterIcon /> },
                      { value: "right", icon: <AlignRightIcon /> },
                    ].map((align) => (
                      <Grid item xs={4} key={align.value}>
                        <AlignmentButton
                          active={text.headlineAlignment === align.value && !text.headlineCustomPosition}
                          onClick={() => applyLayoutPatternHorizontal(align.value)}
                          fullWidth
                        >
                          {align.icon}
                          <Typography variant="caption" sx={{ mt: 0.5, textTransform: "capitalize" }}>
                            {align.value}
                          </Typography>
                        </AlignmentButton>
                      </Grid>
                    ))}
                  </Grid>

                  <Typography variant="body2" sx={{ mb: 1, color: "rgba(255, 255, 255, 0.7)" }}>
                    Text Position
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 3 }}>
                    {[
                      { value: "top", icon: <ArrowUpIcon /> },
                      { value: "middle", icon: <RemoveIcon /> },
                      { value: "bottom", icon: <ArrowDownIcon /> },
                    ].map((pos) => (
                      <Grid item xs={4} key={pos.value}>
                        <AlignmentButton
                          active={text.headlinePosition === pos.value && !text.headlineCustomPosition}
                          onClick={() => applyLayoutPatternVertical(pos.value)}
                          fullWidth
                        >
                          {pos.icon}
                          <Typography variant="caption" sx={{ mt: 0.5, textTransform: "capitalize" }}>
                            {pos.value}
                          </Typography>
                        </AlignmentButton>
                      </Grid>
                    ))}
                  </Grid>

                  <Typography variant="body2" sx={{ mb: 1, mt: 2, color: "rgba(255, 255, 255, 0.7)" }}>
                    All Variations
                  </Typography>
                  <Grid container spacing={1}>
                    {variations.map((variation, index) => (
                      <Grid item xs={6} key={variation.id}>
                        <VariationItem
                          active={selectedVariationId === variation.id}
                          onClick={() => handleVariationSelect(variation.id)}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 4,
                              right: 4,
                              bgcolor: "rgba(0, 0, 0, 0.5)",
                              px: 0.5,
                              borderRadius: 0.5,
                              fontSize: "0.7rem",
                            }}
                          >
                            {variation.style.assets?.length || 0} assets
                          </Box>
                          <Box
                            sx={{
                              position: "absolute",
                              top: 4,
                              left: 4,
                              bgcolor: "rgba(0, 0, 0, 0.5)",
                              px: 0.5,
                              borderRadius: 0.5,
                              fontSize: "0.7rem",
                            }}
                          >
                            V{index + 1}
                          </Box>
                          {assetsChanged && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                width: 8,
                                height: 8,
                                bgcolor: "#FBBF24",
                                borderRadius: "50%",
                                animation: "pulse 2s infinite",
                              }}
                            />
                          )}
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              bgcolor: "#111827",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {/* Thumbnail preview placeholder */}
                          </Box>
                        </VariationItem>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </ContentPanel>
            )}
          </>
        )}
      </StyledDrawer>
    </Box>
  );
};

export default VariationControls;
