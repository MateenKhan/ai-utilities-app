"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, Suspense } from 'react';
import { saveAs } from 'file-saver';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
  GlobalStyles,
} from '@mui/material';
import RouteRegistry from '@/components/RouteRegistry';

export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  font: string;
  fontSize: string;
  fontWeight: string;
  borderRadius: string;
  boxShadow: string;
  customFonts: string[];
  sidebarBackground?: string; // Add sidebar background color
}

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  addTheme: (theme: Theme) => void;
  updateTheme: (theme: Theme) => void;
  deleteTheme: (themeId: string) => void;
  exportThemes: () => Promise<void>;
  importThemes: (data: string) => void;
  exportWithFonts: () => Promise<void>;
}

const defaultTheme: Theme = {
  id: 'default',
  name: 'Default',
  primary: '#3b82f6',
  secondary: '#60a5fa',
  accent: '#93c5fd',
  background: '#ffffff',
  text: '#1f2937',
  font: 'sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  customFonts: [],
  sidebarBackground: '#f8fafc' // Light gray background for sidebar
};

const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  primary: '#6366f1',
  secondary: '#818cf8',
  accent: '#a5b4fc',
  background: '#111827',
  text: '#f9fafb',
  font: 'sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  customFonts: [],
  sidebarBackground: '#1e293b' // Darker background for sidebar
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const readStoredThemes = (): Theme[] => {
  if (typeof window === "undefined") {
    return [defaultTheme, darkTheme];
  }

  const savedThemes = window.localStorage.getItem("customThemes");
  if (!savedThemes) {
    return [defaultTheme, darkTheme];
  }

  try {
    const parsedThemes = JSON.parse(savedThemes);
    return Array.isArray(parsedThemes) && parsedThemes.length > 0
      ? parsedThemes
      : [defaultTheme, darkTheme];
  } catch {
    return [defaultTheme, darkTheme];
  }
};

const readStoredCurrentTheme = (): Theme => {
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  const savedTheme = window.localStorage.getItem("currentTheme");
  if (!savedTheme) {
    return defaultTheme;
  }

  try {
    return JSON.parse(savedTheme);
  } catch {
    return defaultTheme;
  }
};


export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themes, setThemes] = useState<Theme[]>([defaultTheme, darkTheme]);
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Hydrate themes from local storage on mount
  useEffect(() => {
    setMounted(true);
    const storedThemes = readStoredThemes();
    const storedCurrent = readStoredCurrentTheme();

    // Only update if different from defaults to avoid unnecessary re-renders
    // But since we want to restore user state, we should just set them.
    setThemes(storedThemes);
    setCurrentTheme(storedCurrent);
  }, []);
  const parseFontSize = (size: string) => {
    const numeric = parseFloat(size);
    if (Number.isNaN(numeric)) {
      return 16;
    }
    if (size.includes("rem")) {
      return numeric * 16;
    }
    return numeric;
  };

  const parseBorderRadius = (radius: string) => {
    const numeric = parseFloat(radius);
    if (Number.isNaN(numeric)) {
      return 8;
    }
    // Assume rem translates to px
    if (radius.includes("rem")) {
      return numeric * 16;
    }
    return numeric;
  };

  const isDarkColor = (hex: string) => {
    const sanitized = hex.replace("#", "");
    if (sanitized.length !== 6) {
      return false;
    }
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance < 140;
  };

  const getFontWeight = (weight: string) => {
    switch (weight) {
      case "bold":
        return 700;
      case "lighter":
        return 300;
      case "bolder":
        return 800;
      default:
        return 400;
    }
  };

  const muiTheme = useMemo(() => {
    const paletteMode = isDarkColor(currentTheme.background) ? "dark" : "light";
    const regularWeight = getFontWeight(currentTheme.fontWeight);

    const typography = {
      fontFamily: currentTheme.font,
      fontSize: parseFontSize(currentTheme.fontSize),
      fontWeightRegular: regularWeight,
      fontWeightMedium: Math.min(regularWeight + 100, 700),
    };

    return createTheme({
      palette: {
        mode: paletteMode,
        primary: {
          main: currentTheme.primary,
        },
        secondary: {
          main: currentTheme.secondary,
        },
        text: {
          primary: currentTheme.text,
        },
        background: {
          default: currentTheme.background,
          paper: currentTheme.sidebarBackground || currentTheme.background,
        },
      },
      shape: {
        borderRadius: parseBorderRadius(currentTheme.borderRadius),
      },
      typography,
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              borderRadius: currentTheme.borderRadius,
              boxShadow: currentTheme.boxShadow,
              // Mobile optimization: verify min-height for touch
              [createTheme().breakpoints.down('sm')]: {
                minHeight: '44px',
                padding: '8px 16px',
              },
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              [createTheme().breakpoints.down('sm')]: {
                padding: 12, // Increases touch target
              },
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              [createTheme().breakpoints.down('sm')]: {
                fontSize: '16px', // Prevents iOS zoom on inputs
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: currentTheme.borderRadius,
              boxShadow: currentTheme.boxShadow,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: currentTheme.borderRadius,
              boxShadow: currentTheme.boxShadow,
            },
          },
        },
      },
    });
  }, [currentTheme]);

  // Save themes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customThemes', JSON.stringify(themes));
    localStorage.setItem('currentTheme', JSON.stringify(currentTheme));
  }, [themes, currentTheme]);

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--background', currentTheme.background);
    root.style.setProperty('--text', currentTheme.text);
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--secondary', currentTheme.secondary);
    root.style.setProperty('--accent', currentTheme.accent);
    root.style.setProperty('--font-family', currentTheme.font);
    root.style.setProperty('--font-size', currentTheme.fontSize);
    root.style.setProperty('--font-weight', currentTheme.fontWeight);
    root.style.setProperty('--border-radius', currentTheme.borderRadius);
    root.style.setProperty('--box-shadow', currentTheme.boxShadow);
    root.style.setProperty('--sidebar-background', currentTheme.sidebarBackground || currentTheme.background);

    // Apply font family and background to body
    document.body.style.fontFamily = currentTheme.font;
    document.body.style.fontSize = currentTheme.fontSize;
    document.body.style.fontWeight = currentTheme.fontWeight;
    document.body.style.backgroundColor = currentTheme.background;
    document.body.style.transition = 'background-color 0.3s ease';

    // Add custom fonts
    const existingFonts = document.querySelectorAll('[data-custom-font]');
    existingFonts.forEach(font => font.remove());

    currentTheme.customFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      link.setAttribute('data-custom-font', 'true');
      document.head.appendChild(link);
    });
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId) || defaultTheme;
    setCurrentTheme(theme);
  };

  const addTheme = (theme: Theme) => {
    setThemes(prev => [...prev, theme]);
  };

  const updateTheme = (theme: Theme) => {
    setThemes(prev => prev.map(t => t.id === theme.id ? theme : t));
    if (currentTheme.id === theme.id) {
      setCurrentTheme(theme);
    }
  };

  const deleteTheme = (themeId: string) => {
    setThemes(prev => prev.filter(t => t.id !== themeId));
    if (currentTheme.id === themeId) {
      setCurrentTheme(defaultTheme);
    }
  };

  const exportThemes = async (): Promise<void> => {
    const data = JSON.stringify({
      themes,
      currentThemeId: currentTheme.id
    });

    const blob = new Blob([data], { type: 'application/json' });
    saveAs(blob, 'themes.json');
  };

  const importThemes = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      setThemes(parsed.themes);

      const newCurrentTheme = parsed.themes.find((t: Theme) => t.id === parsed.currentThemeId) || defaultTheme;
      setCurrentTheme(newCurrentTheme);
    } catch (e) {
      console.error('Failed to import themes', e);
    }
  };

  // This function is now handled by the save-load page
  const exportWithFonts = async (): Promise<void> => {
    console.warn('exportWithFonts is deprecated. Use the save-load page for complete data export.');
    // This function is kept for backward compatibility but the save-load page handles complete export
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themes,
      setTheme,
      addTheme,
      updateTheme,
      deleteTheme,
      exportThemes,
      importThemes,
      exportWithFonts,
    }}>
      <NotificationProvider>
        <SidebarProvider>
          <Suspense fallback={null}>
            <RouteRegistry />
          </Suspense>
          <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <GlobalStyles
              styles={{
                // Ensure text contrast for form labels and typography
                '.MuiInputLabel-root': {
                  color: currentTheme.text,
                  opacity: 0.8,
                },
                '.MuiInputLabel-root.Mui-focused': {
                  color: currentTheme.primary,
                  opacity: 1,
                },
                '.MuiTypography-root': {
                  color: currentTheme.text,
                },
                '.MuiTypography-colorTextSecondary': {
                  color: currentTheme.text,
                  opacity: 0.7
                },
                // Enhance card readability in themes
                '.MuiCard-root, .MuiPaper-root': {
                  backgroundColor: currentTheme.id === 'dark'
                    ? 'rgba(30, 41, 59, 0.75)'
                    : 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(12px)',
                  borderColor: currentTheme.id === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }
              }}
            />
            {children}
          </MuiThemeProvider>
        </SidebarProvider>
      </NotificationProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
