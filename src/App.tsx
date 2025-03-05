// src/App.tsx
import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";

import useThumbnailStore from "./store/thumbnailStore";
import ThumbnailCanvas from "./components/ThumbnailCanvas";
import StyleControls from "./components/StyleControls";
import TextControls from "./components/TextControls";
import VariationControls from "./components/VariationControls";
import DownloadButton from "./components/DownloadButton";

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3B82F6", // Tailwind blue-500
    },
    secondary: {
      main: "#10B981", // Tailwind emerald-500
    },
    background: {
      default: "#111827", // Tailwind gray-900
      paper: "#1F2937", // Tailwind gray-800
    },
    text: {
      primary: "#F9FAFB", // Tailwind gray-50
      secondary: "#D1D5DB", // Tailwind gray-300
    },
    error: {
      main: "#EF4444", // Tailwind red-500
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Add keyframes for animations
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

function App() {
  // Track window height for responsive calculations
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  // Update window height when window is resized
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <style>{globalStyles}</style>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {/* Main Content with Dual Sidebars */}
        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          {/* Left Sidebar: Style Controls - PRESERVED AS IS */}
          <StyleControls />

          {/* Main Content Area - OPTIMIZED */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              width: "100%",
            }}
          >
            {/* Header Section - Compact */}
            <Box sx={{ p: 2, pb: 1 }}>
              {/* App Title */}
              <h1 className="font-thumbnailstudio mb-1" style={{ fontSize: "1rem", margin: 0, marginBottom: "8px" }}>
                Thumbnail Studio
              </h1>
              
              {/* Text Controls - Compacted */}
              <Box sx={{ 
                bgcolor: "background.paper", 
                p: 1.5, 
                borderRadius: 2, 
                boxShadow: 2,
                display: "flex",
                alignItems: "center"
              }}>
                <TextControls isHorizontal={true} />
              </Box>
            </Box>

            {/* Preview Section - OPTIMIZED for viewport fit */}
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                p: 2,
                pt: 0,
                overflow: "hidden", // Prevent internal scrolling
                height: `calc(100vh - 140px)`, // Account for header and footer
              }}
            >
              <Box
                sx={{
                  bgcolor: "background.paper",
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  height: "100%", // Use full height
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Preview
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    position: "relative",
                    borderRadius: 1,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Responsive container for ThumbnailCanvas */}
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ThumbnailCanvas />
                  </Box>
                  
                  {/* Resolution indicator */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      bgcolor: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Sidebar: Variation Controls - PRESERVED AS IS */}
          <VariationControls />
        </Box>

        {/* Fixed Download Button - PRESERVED AS IS */}
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "background.paper",
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            zIndex: 50,
          }}
        >
          <DownloadButton />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;