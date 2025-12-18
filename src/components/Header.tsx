"use client";
import { useState, useEffect } from "react";
import { AppBar, Toolbar, IconButton, Typography, Stack, Tooltip } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import ThemeSelector from "@/components/ThemeSelector";
import { useSidebar } from "@/contexts/SidebarContext";
import { APP_BAR_HEIGHT } from "./layoutConstants";

export default function Header() {
  const { toggleSidebar, toggleCollapse } = useSidebar();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFull = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      setIsFullscreen(isFull);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const handleFullscreenToggle = () => {
    const doc = document as any;
    const elem = document.documentElement as any;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((e: Error) => console.error(e));
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ minHeight: APP_BAR_HEIGHT, gap: 2 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => {
            // Check if we are on mobile or desktop to decide which toggle to use
            if (window.innerWidth < 900) {
              toggleSidebar();
            } else {
              toggleCollapse();
            }
          }}
          sx={{ display: "flex" }} // Always show hamburger
          aria-label="Toggle navigation"
        >
          <MenuRoundedIcon />
        </IconButton>
        <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>
          <BuildRoundedIcon sx={{ color: "#ff4081" }} />
          <Typography variant="h6" noWrap>
            Airtajal Utilities
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            <IconButton onClick={handleFullscreenToggle} color="inherit">
              {isFullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
            </IconButton>
          </Tooltip>
          <ThemeSelector />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
