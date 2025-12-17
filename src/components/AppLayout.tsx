"use client";

import { Box, Container, Typography } from "@mui/material";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { SIDEBAR_WIDTH, MINI_SIDEBAR_WIDTH, APP_BAR_HEIGHT } from "@/components/layoutConstants";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    const sidebarWidth = isCollapsed ? MINI_SIDEBAR_WIDTH : SIDEBAR_WIDTH;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Header />
            <Sidebar />
            <Box
                component="main"
                sx={{
                    ml: { md: `${sidebarWidth}px` },
                    pt: `${APP_BAR_HEIGHT}px`,
                    px: { xs: 2, md: 4 },
                    pb: 4,
                    transition: "margin-left 0.3s ease", // Smooth transition
                }}
            >
                <Container maxWidth="lg" sx={{ py: 2 }}>
                    {children}
                </Container>
            </Box>

        </Box>
    );
}
