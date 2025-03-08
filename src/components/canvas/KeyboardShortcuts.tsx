// src/components/canvas/KeyboardShortcuts.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import { Keyboard } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ShortcutsButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  zIndex: 10,
  backgroundColor: "rgba(38, 50, 56, 0.85)",
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: "rgba(38, 50, 56, 0.95)",
  },
}));

const ShortcutsCard = styled(Card)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(6),
  bottom: theme.spacing(6),
  zIndex: 100,
  maxWidth: 320,
  backgroundColor: "rgba(38, 50, 56, 0.95)",
  color: theme.palette.common.white,
  boxShadow: theme.shadows[8],
}));

const KeyboardShortcut = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: theme.spacing(0.5, 0),
}));

const KeyCombination = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
}));

const KeyCapBadge = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.25, 0.75),
  fontSize: "0.75rem",
  fontWeight: "bold",
  minWidth: 20,
  textAlign: "center",
}));

interface KeyboardShortcutsProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onToggle: (event: React.MouseEvent<HTMLElement>) => void;
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  open,
  anchorEl,
  onToggle,
  onClose,
}) => {
  const renderShortcutsContent = () => (
    <ShortcutsCard>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: "medium", mb: 1 }}>
          Keyboard Shortcuts
        </Typography>

        <Divider sx={{ my: 1 }} />

        <KeyboardShortcut>
          <Typography variant="body2">Move selection</Typography>
          <KeyCombination>
            <KeyCapBadge>↑</KeyCapBadge>
            <KeyCapBadge>↓</KeyCapBadge>
            <KeyCapBadge>←</KeyCapBadge>
            <KeyCapBadge>→</KeyCapBadge>
          </KeyCombination>
        </KeyboardShortcut>

        <KeyboardShortcut>
          <Typography variant="body2">Faster movement</Typography>
          <KeyCombination>
            <KeyCapBadge>Shift</KeyCapBadge>
            <KeyCapBadge>+</KeyCapBadge>
            <KeyCapBadge>Arrow</KeyCapBadge>
          </KeyCombination>
        </KeyboardShortcut>

        <KeyboardShortcut>
          <Typography variant="body2">Toggle grid snap</Typography>
          <KeyCombination>
            <KeyCapBadge>Ctrl</KeyCapBadge>
            <KeyCapBadge>+</KeyCapBadge>
            <KeyCapBadge>G</KeyCapBadge>
          </KeyCombination>
        </KeyboardShortcut>

        <KeyboardShortcut>
          <Typography variant="body2">Toggle guides</Typography>
          <KeyCombination>
            <KeyCapBadge>Ctrl</KeyCapBadge>
            <KeyCapBadge>+</KeyCapBadge>
            <KeyCapBadge>A</KeyCapBadge>
          </KeyCombination>
        </KeyboardShortcut>

        <KeyboardShortcut>
          <Typography variant="body2">Delete element</Typography>
          <KeyCombination>
            <KeyCapBadge>Del</KeyCapBadge>
          </KeyCombination>
        </KeyboardShortcut>

        <KeyboardShortcut>
          <Typography variant="body2">Bring forward</Typography>
          <KeyCombination>
            <KeyCapBadge>Ctrl</KeyCapBadge>
            <KeyCapBadge>+</KeyCapBadge>
            <KeyCapBadge>]</KeyCapBadge>
          </KeyCombination>
        </KeyboardShortcut>

        <KeyboardShortcut>
          <Typography variant="body2">Send backward</Typography>
          <KeyCombination>
            <KeyCapBadge>Ctrl</KeyCapBadge>
            <KeyCapBadge>+</KeyCapBadge>
            <KeyCapBadge>[</KeyCapBadge>
          </KeyCombination>
        </KeyboardShortcut>
      </CardContent>
    </ShortcutsCard>
  );

  return (
    <>
      <Tooltip title="Keyboard Shortcuts">
        <ShortcutsButton size="small" onClick={onToggle}>
          <Keyboard />
        </ShortcutsButton>
      </Tooltip>

      {open && anchorEl && (
        <Popper open={true} anchorEl={anchorEl} placement="top-end">
          <ClickAwayListener onClickAway={onClose}>
            {renderShortcutsContent()}
          </ClickAwayListener>
        </Popper>
      )}
    </>
  );
};