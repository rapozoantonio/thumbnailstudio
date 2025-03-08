// src/components/canvas/ControlPanel.tsx
import React from 'react';
import { 
  Paper, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { 
  GridOn, 
  GridOff, 
  Straighten 
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledControlPanel = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  padding: theme.spacing(1),
  zIndex: 10,
  backgroundColor: "rgba(38, 50, 56, 0.9)",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
}));

interface ControlPanelProps {
  snapToGridEnabled: boolean;
  showGuides: boolean;
  onToggleSnapToGrid: () => void;
  onToggleGuides: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  snapToGridEnabled,
  showGuides,
  onToggleSnapToGrid,
  onToggleGuides
}) => {
  // Convert boolean values to string values for MUI props
  const snapButtonColor = snapToGridEnabled ? "primary" : "default";
  const guidesButtonColor = showGuides ? "primary" : "default";
  
  return (
    <StyledControlPanel elevation={3}>
      <Tooltip title="Toggle grid snapping (Ctrl+G)" placement="left">
        <IconButton 
          size="small" 
          color={snapButtonColor}
          onClick={onToggleSnapToGrid}
        >
          {snapToGridEnabled ? <GridOn /> : <GridOff />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Toggle alignment guides (Ctrl+A)" placement="left">
        <IconButton 
          size="small" 
          color={guidesButtonColor}
          onClick={onToggleGuides}
        >
          <Straighten />
        </IconButton>
      </Tooltip>
    </StyledControlPanel>
  );
};