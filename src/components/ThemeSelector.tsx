"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useTheme } from "./ThemeProvider";

const ThemeSelector: React.FC = () => {
  const {
    currentTheme,
    themes,
    setTheme,
    addTheme,
    updateTheme,
  } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [fontManagerOpen, setFontManagerOpen] = useState(false);
  const [tempTheme, setTempTheme] = useState({ ...currentTheme });
  const [fontUrl, setFontUrl] = useState("");

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    handleMenuClose();
  };

  const handleCustomize = () => {
    setTempTheme({ ...currentTheme });
    setCustomizerOpen(true);
    handleMenuClose();
  };

  const handleSaveCustomTheme = () => {
    if (tempTheme.id === "default" || tempTheme.id === "dark") {
      const newTheme = {
        ...tempTheme,
        id: `custom-${Date.now()}`,
        name: tempTheme.name || "Custom Theme",
      };
      addTheme(newTheme);
      setTheme(newTheme.id);
    } else {
      updateTheme(tempTheme);
      setTheme(tempTheme.id);
    }
    setCustomizerOpen(false);
  };

  const handleAddFont = () => {
    if (fontUrl && !tempTheme.customFonts.includes(fontUrl)) {
      setTempTheme((prev) => ({
        ...prev,
        customFonts: [...prev.customFonts, fontUrl],
      }));
      setFontUrl("");
    }
  };

  const handleRemoveFont = (url: string) => {
    setTempTheme((prev) => ({
      ...prev,
      customFonts: prev.customFonts.filter((font) => font !== url),
    }));
  };

  const apply603010Rule = () => {
    setTempTheme((prev) => ({
      ...prev,
      secondary: prev.primary,
      accent: prev.primary,
    }));
  };

  const updateThemeField = <K extends keyof typeof tempTheme>(key: K, value: (typeof tempTheme)[K]) => {
    setTempTheme((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderColorField = (label: string, key: keyof typeof tempTheme) => (
    <Stack spacing={1} key={key as string}>
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          type="color"
          value={(tempTheme[key] as string) || "#000000"}
          onChange={(e) => updateThemeField(key, e.target.value as (typeof tempTheme)[keyof typeof tempTheme])}
          inputProps={{ style: { padding: 0, width: 56, height: 40 } }}
          sx={{ width: 56 }}
        />
        <TextField
          fullWidth
          size="small"
          value={(tempTheme[key] as string) || ""}
          onChange={(e) => updateThemeField(key, e.target.value as (typeof tempTheme)[keyof typeof tempTheme])}
        />
      </Stack>
    </Stack>
  );

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        endIcon={<ExpandMoreIcon />}
        onClick={handleMenuOpen}
        startIcon={<PaletteRoundedIcon />}
      >
        Theme
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        keepMounted
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 220, mt: 1.5, borderRadius: 2 }
        }}
      >
        <Box px={2} py={1.5}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Select Theme
          </Typography>
        </Box>
        {themes.map((theme) => (
          <MenuItem
            key={theme.id}
            selected={currentTheme.id === theme.id}
            onClick={() => handleThemeChange(theme.id)}
            sx={{
              py: 1,
              px: 2,
              '&.Mui-selected': { bgcolor: 'action.hover' }
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: theme.primary,
                border: '2px solid',
                borderColor: 'background.paper',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                mr: 2,
              }}
            />
            <Typography variant="body2" fontWeight={500} flexGrow={1}>
              {theme.name}
            </Typography>
            {currentTheme.id === theme.id && <CheckRoundedIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleCustomize} sx={{ py: 1.5 }}>
          <SettingsRoundedIcon fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
          <Typography variant="body2">Customize</Typography>
        </MenuItem>
      </Menu>

      <Dialog open={customizerOpen} onClose={() => setCustomizerOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Customize Theme</Typography>
            <IconButton onClick={() => setCustomizerOpen(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Theme Name"
              value={tempTheme.name}
              onChange={(e) => updateThemeField("name", e.target.value)}
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
              <Typography variant="subtitle2" flexGrow={1}>
                Theme Colors (60-30-10)
              </Typography>
              <Button size="small" variant="outlined" onClick={apply603010Rule}>
                Apply Rule
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {renderColorField("Primary (60%)", "primary")}
              {renderColorField("Secondary (30%)", "secondary")}
              {renderColorField("Accent (10%)", "accent")}
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {renderColorField("Background", "background")}
              {renderColorField("Text", "text")}
              {renderColorField("Sidebar Background", "sidebarBackground")}
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Font Family"
                value={tempTheme.font}
                onChange={(e) => updateThemeField("font", e.target.value)}
                fullWidth
              />
              <TextField
                label="Font Size"
                value={tempTheme.fontSize}
                onChange={(e) => updateThemeField("fontSize", e.target.value)}
                fullWidth
              />
              <TextField
                label="Font Weight"
                value={tempTheme.fontWeight}
                onChange={(e) => updateThemeField("fontWeight", e.target.value)}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Border Radius"
                value={tempTheme.borderRadius}
                onChange={(e) => updateThemeField("borderRadius", e.target.value)}
                fullWidth
              />
              <TextField
                label="Box Shadow"
                value={tempTheme.boxShadow}
                onChange={(e) => updateThemeField("boxShadow", e.target.value)}
                fullWidth
              />
            </Stack>

            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2">Custom Fonts</Typography>
                <Button size="small" onClick={() => setFontManagerOpen((prev) => !prev)}>
                  {fontManagerOpen ? "Hide" : "Manage"}
                </Button>
              </Stack>
              <Collapse in={fontManagerOpen}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField
                      label="Font stylesheet URL"
                      value={fontUrl}
                      onChange={(e) => setFontUrl(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <Button variant="contained" onClick={handleAddFont}>
                      Add
                    </Button>
                  </Stack>
                  {tempTheme.customFonts.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No custom fonts added yet.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {tempTheme.customFonts.map((font) => (
                        <Chip
                          key={font}
                          label={font}
                          onDelete={() => handleRemoveFont(font)}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Collapse>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomizerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCustomTheme}>
            Save Theme
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ThemeSelector;

