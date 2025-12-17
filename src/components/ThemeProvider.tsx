"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { saveAs } from 'file-saver';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
  GlobalStyles,
} from '@mui/material';

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
  const [themes, setThemes] = useState<Theme[]>(readStoredThemes);
  const [currentTheme, setCurrentTheme] = useState<Theme>(readStoredCurrentTheme);
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

    // Apply font family to body
    document.body.style.fontFamily = currentTheme.font;
    document.body.style.fontSize = currentTheme.fontSize;
    document.body.style.fontWeight = currentTheme.fontWeight;

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
      exportWithFonts
    }}>
      <NotificationProvider>
        <SidebarProvider>
          <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <GlobalStyles
              styles={{
                '@keyframes twinkle': {
                  '0%': { opacity: 0.7 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.7 },
                },
                '@keyframes moveStars': {
                  'from': { backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0' },
                  'to': { backgroundPosition: '0 1000px, 0 500px, 0 400px, 0 300px, 0 200px, 0 100px, 0 50px, 0 150px, 0 0' }
                },
                '@keyframes moveLeaves': {
                  '0%': { backgroundPosition: '0% 0%' },
                  '50%': { backgroundPosition: '100% 100%' },
                  '100%': { backgroundPosition: '0% 0%' },
                },
                body: {
                  backgroundColor: 'transparent !important', // Ensure body is transparent
                  color: currentTheme.text,
                  transition: 'color 0.3s ease',
                  minHeight: '100vh',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                    transition: 'background-image 0.5s ease',
                    pointerEvents: 'none',
                    // Apply base background color here if not theme specific, 
                    // or rely on the gradients including the base color.
                    backgroundColor: currentTheme.background,
                    ...(currentTheme.id === 'dark' ? {
                      backgroundImage: `
                          radial-gradient(2px 2px at 10% 10%, rgba(255,255,255,0.9) 1px, transparent 0),
                          radial-gradient(2px 2px at 20% 40%, rgba(255,255,255,0.7) 1px, transparent 0),
                          radial-gradient(2px 2px at 30% 70%, rgba(255,255,255,0.8) 1px, transparent 0),
                          radial-gradient(1.5px 1.5px at 40% 20%, rgba(255,255,255,0.9) 1px, transparent 0),
                          radial-gradient(2px 2px at 60% 60%, rgba(255,255,255,0.7) 1px, transparent 0),
                          radial-gradient(2px 2px at 70% 30%, rgba(255,255,255,0.9) 1px, transparent 0),
                          radial-gradient(1.5px 1.5px at 80% 80%, rgba(255,255,255,0.8) 1px, transparent 0),
                          radial-gradient(2px 2px at 90% 10%, rgba(255,255,255,0.7) 1px, transparent 0),
                          linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)
                        `,
                      backgroundSize: '550px 550px, 350px 350px, 250px 250px, 150px 150px, 450px 450px, 300px 300px, 200px 200px, 100px 100px, cover',
                      backgroundAttachment: 'fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed, fixed',
                      animation: 'moveStars 60s linear infinite',
                    } : {}),
                    ...(currentTheme.id === 'default' ? {
                      backgroundImage: `
                          radial-gradient(circle at 50% -20%, rgba(253, 224, 71, 0.4) 0%, transparent 40%),
                          radial-gradient(circle at 100% 0%, rgba(74, 222, 128, 0.2) 0%, transparent 30%),
                          radial-gradient(circle at 0% 100%, rgba(34, 197, 94, 0.15) 0%, transparent 40%),
                          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.4) 0%, transparent 20%),
                          linear-gradient(to bottom right, #f0f9ff 0%, #dcfce7 100%)
                        `,
                      backgroundSize: '120% 120%, 100% 100%, 100% 100%, 80% 80%, cover',
                      animation: 'moveLeaves 30s ease-in-out infinite alternate',
                    } : {}),
                  },
                },
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
