"use client";

import { AppBar, Toolbar, IconButton, Typography, Stack } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ThemeSelector from "@/components/ThemeSelector";
import { useSidebar } from "@/contexts/SidebarContext";
import { APP_BAR_HEIGHT } from "./layoutConstants";

export default function Header() {
  const { toggleSidebar, toggleCollapse } = useSidebar();

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
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          Utilities App
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ThemeSelector />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
