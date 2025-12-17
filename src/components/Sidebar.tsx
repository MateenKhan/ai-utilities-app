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
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import SaveAltRoundedIcon from "@mui/icons-material/SaveAltRounded";
import { useSidebar } from "@/contexts/SidebarContext";
import { useTheme as useAppTheme } from "@/components/ThemeProvider";
import { SIDEBAR_WIDTH, MINI_SIDEBAR_WIDTH, APP_BAR_HEIGHT } from "./layoutConstants";

const NAV_ITEMS = [
  { href: "/todo", label: "Todo List", icon: <ChecklistRoundedIcon fontSize="small" sx={{ color: "#4caf50" }} /> },
  { href: "/bookmarks", label: "Bookmarks", icon: <BookmarkBorderRoundedIcon fontSize="small" sx={{ color: "#9c27b0" }} /> },
  { href: "/calculator", label: "Calculator", icon: <CalculateRoundedIcon fontSize="small" sx={{ color: "#ff9800" }} /> },
  { href: "/image-tiles", label: "Image Tiles", icon: <ImageRoundedIcon fontSize="small" sx={{ color: "#f44336" }} /> },
  { href: "/save-load", label: "Save/Load", icon: <SaveAltRoundedIcon fontSize="small" sx={{ color: "#607d8b" }} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar, isCollapsed } = useSidebar();
  const { currentTheme } = useAppTheme();

  const getDrawerContent = (isMobile: boolean) => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: currentTheme.sidebarBackground || "background.paper",
      }}
    >
      <Box sx={{ px: (isCollapsed && !isMobile) ? 1 : 3, pt: 3, pb: 1, display: 'flex', justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start' }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ display: (isCollapsed && !isMobile) ? 'none' : 'block' }}>
          Airtajal Utilities
        </Typography>
        {(isCollapsed && !isMobile) && <Typography variant="caption" fontWeight={700}>AU</Typography>}
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
                mx: (isCollapsed && !isMobile) ? 1 : 1.5,
                my: 0.5,
                justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start',
                px: (isCollapsed && !isMobile) ? 1 : 2,
                border: "2px solid transparent",
                "&.Mui-selected": {
                  bgcolor: "transparent",
                  borderColor: "primary.main",
                  color: "text.primary",
                  "& .MuiSvgIcon-root": {
                    transform: "scale(1.3)",
                    transition: "transform 0.2s",
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))"
                  },
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: "primary.dark",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: (isCollapsed && !isMobile) ? 0 : 36, mr: (isCollapsed && !isMobile) ? 0 : undefined, justifyContent: 'center' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  opacity: (isCollapsed && !isMobile) ? 0 : 1,
                  display: (isCollapsed && !isMobile) ? 'none' : 'block',
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap'
                }}
              />
            </ListItemButton>
          </Link>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 3, display: (isCollapsed && !isMobile) ? 'none' : 'block' }}>
        <Typography variant="caption" color="text.secondary">
          Airtajal Utilities v1.0
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
        {getDrawerContent(true)}
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
        {getDrawerContent(false)}
      </Drawer>
    </>
  );
}
