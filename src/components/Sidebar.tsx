"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import SaveAltRoundedIcon from "@mui/icons-material/SaveAltRounded";
import { useSidebar } from "@/contexts/SidebarContext";
import { useTheme as useAppTheme } from "@/components/ThemeProvider";
import { SIDEBAR_WIDTH, MINI_SIDEBAR_WIDTH, APP_BAR_HEIGHT } from "./layoutConstants";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: <HomeRoundedIcon fontSize="small" /> },
  { href: "/bookmarks", label: "Bookmarks", icon: <BookmarkBorderRoundedIcon fontSize="small" /> },
  { href: "/calculator", label: "Calculator", icon: <CalculateRoundedIcon fontSize="small" /> },
  { href: "/todo", label: "Todo", icon: <ChecklistRoundedIcon fontSize="small" /> },
  { href: "/image-tiles", label: "Image Tiles", icon: <ImageRoundedIcon fontSize="small" /> },
  { href: "/save-load", label: "Save/Load", icon: <SaveAltRoundedIcon fontSize="small" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar, isCollapsed } = useSidebar();
  const { currentTheme } = useAppTheme();

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: currentTheme.sidebarBackground || "background.paper",
      }}
    >
      <Box sx={{ px: isCollapsed ? 1 : 3, pt: 3, pb: 1, display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ display: isCollapsed ? 'none' : 'block' }}>
          Utilities App
        </Typography>
        {isCollapsed && <Typography variant="caption" fontWeight={700}>UA</Typography>}
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <ListItemButton
              selected={pathname === item.href}
              onClick={closeSidebar}
              sx={{
                borderRadius: 2,
                mx: isCollapsed ? 1 : 1.5,
                my: 0.5,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                px: isCollapsed ? 1 : 2,
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.main" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 36, color: "inherit", mr: isCollapsed ? 0 : undefined, justifyContent: 'center' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  opacity: isCollapsed ? 0 : 1,
                  display: isCollapsed ? 'none' : 'block',
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap'
                }}
              />
            </ListItemButton>
          </Link>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 3, display: isCollapsed ? 'none' : 'block' }}>
        <Typography variant="caption" color="text.secondary">
          Utilities App v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={closeSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            bgcolor: currentTheme.sidebarBackground || "background.paper",
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: isCollapsed ? MINI_SIDEBAR_WIDTH : SIDEBAR_WIDTH,
            top: APP_BAR_HEIGHT,
            height: `calc(100% - ${APP_BAR_HEIGHT}px)`,
            boxSizing: "border-box",
            bgcolor: currentTheme.sidebarBackground || "background.paper",
            borderRight: 0,
            overflowX: "hidden",
            transition: "width 0.3s ease",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
