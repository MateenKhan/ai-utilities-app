import { useState, useEffect } from "react";
import { AppBar, Toolbar, IconButton, Typography, Stack, Tooltip, Button, Avatar, Menu, MenuItem, Box } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import ThemeSelector from "@/components/ThemeSelector";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { APP_BAR_HEIGHT } from "./layoutConstants";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const { toggleSidebar, toggleCollapse } = useSidebar();
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
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
            if (window.innerWidth < 900) {
              toggleSidebar();
            } else {
              toggleCollapse();
            }
          }}
          sx={{ display: "flex" }}
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

          {!loading && (
            user ? (
              <>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box px={2} py={1}>
                    <Typography variant="subtitle2">{user.name || "User"}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  </Box>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Stack direction="row" spacing={1} ml={1}>
                <Button component={Link} href="/login" variant="text" size="small">
                  Login
                </Button>
                <Button component={Link} href="/signup" variant="contained" size="small">
                  Sign Up
                </Button>
              </Stack>
            )
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
