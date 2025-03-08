// src/components/thumbnail-canvas/components/SelectionHint.tsx
import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledHelpTooltip = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "rgba(38, 50, 56, 0.9)",
  color: theme.palette.common.white,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  maxWidth: 320,
  zIndex: 20,
  textAlign: "center",
  boxShadow: theme.shadows[10],
}));

interface SelectionHintProps {
  onDismiss: () => void;
}

export const SelectionHint: React.FC<SelectionHintProps> = ({ onDismiss }) => {
  return (
    <StyledHelpTooltip>
      <Typography variant="subtitle1" fontWeight="medium">
        Click any element to select and edit it
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
        Use arrow keys for precise movement
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Tooltip title="Dismiss">
          <IconButton size="small" sx={{ color: "white" }} onClick={onDismiss}>
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </StyledHelpTooltip>
  );
};