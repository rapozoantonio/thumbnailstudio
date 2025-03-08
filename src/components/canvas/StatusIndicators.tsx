// 2. Next, let's update the StatusIndicators component to fix the button/active attributes
// src/components/canvas/StatusIndicators.tsx

import React from 'react';
import { 
  Chip, 
  IconButton
} from '@mui/material';
import { 
  GridOn, 
  Straighten, 
  InfoOutlined, 
  Wallpaper,
  DeleteOutline 
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledStatusChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  left: theme.spacing(1),
  top: theme.spacing(1),
  zIndex: 10,
  backgroundColor: "rgba(38, 50, 56, 0.85)",
}));

const StyledBackgroundIndicator = styled(Chip)(({ theme }) => ({
  position: "absolute",
  left: theme.spacing(1),
  bottom: theme.spacing(1),
  zIndex: 10,
  backgroundColor: "rgba(38, 50, 56, 0.85)",
}));

interface StatusChipProps {
  snapToGridEnabled: boolean;
  showGuides: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  snapToGridEnabled,
  showGuides
}) => {
  // Determine the color prop value as a string
  const colorProp = (snapToGridEnabled || showGuides) ? "primary" : "default";
  
  return (
    <StyledStatusChip
      size="small"
      variant="filled"
      color={colorProp}
      label={
        snapToGridEnabled && showGuides
          ? "Grid & Guides On"
          : snapToGridEnabled
          ? "Grid On"
          : showGuides
          ? "Guides On"
          : "No Helpers"
      }
      icon={
        snapToGridEnabled ? (
          <GridOn fontSize="small" />
        ) : showGuides ? (
          <Straighten fontSize="small" />
        ) : (
          <InfoOutlined fontSize="small" />
        )
      }
    />
  );
};

interface BackgroundIndicatorProps {
  onRemoveBackground: () => void;
}

export const BackgroundIndicator: React.FC<BackgroundIndicatorProps> = ({
  onRemoveBackground
}) => {
  return (
    <StyledBackgroundIndicator
      size="small"
      variant="filled"
      color="primary"
      label="Background Image"
      icon={<Wallpaper fontSize="small" />}
      onClick={onRemoveBackground}
      onDelete={onRemoveBackground}
      deleteIcon={<DeleteOutline fontSize="small" />}
    />
  );
};