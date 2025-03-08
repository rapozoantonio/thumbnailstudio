// 1. First, let's fix the SelectionOverlay component to prevent the "Cannot read properties of null" error
// src/components/canvas/SelectionOverlay.tsx

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  VerticalAlignTop,
  VerticalAlignBottom,
  DeleteOutline,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledSelectionOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  zIndex: 5,
  padding: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  backgroundColor: "rgba(33, 150, 243, 0.15)",
  backdropFilter: "blur(4px)",
  borderRadius: theme.shape.borderRadius,
}));

interface SelectionOverlayProps {
  x: number;
  y: number;
  name: string;
  coordinates: string;
  type: "asset" | "text" | null;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDelete: () => void;
}

// Remove the forwardRef as it's creating issues with MUI transitions
export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  x,
  y,
  name,
  coordinates,
  type,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onDelete,
}) => {
  return (
    <StyledSelectionOverlay sx={{ top: y, left: x }}>
      <Typography variant="caption" sx={{ fontWeight: "medium", mr: 1 }}>
        {name} {coordinates}
      </Typography>

      {type === "asset" && (
        <>
          <Tooltip title="Bring Forward (Ctrl+])">
            <IconButton size="small" onClick={onBringForward}>
              <ArrowUpward fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Backward (Ctrl+[)">
            <IconButton size="small" onClick={onSendBackward}>
              <ArrowDownward fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bring to Front">
            <IconButton size="small" onClick={onBringToFront}>
              <VerticalAlignTop fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send to Back">
            <IconButton size="small" onClick={onSendToBack}>
              <VerticalAlignBottom fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}

      <Tooltip title={type === "text" ? "Reset Position" : "Delete (Del)"}>
        <IconButton size="small" onClick={onDelete}>
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Tooltip>
    </StyledSelectionOverlay>
  );
};