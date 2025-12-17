"use client";

import { Box } from "@mui/material";
import { useTheme } from "@/components/ThemeProvider";

export default function AnimatedBackground() {
    const { currentTheme, animationsEnabled } = useTheme();

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                pointerEvents: "none",
                backgroundColor: currentTheme.background,
                transition: "background-color 0.3s ease",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    ...(currentTheme.id === 'dark' ? {
                        backgroundImage: `
                    radial-gradient(2px 2px at 10% 10%, rgba(255,255,255,1) 1px, transparent 0),
                    radial-gradient(2px 2px at 20% 40%, rgba(255,255,255,0.8) 1px, transparent 0),
                    radial-gradient(2px 2px at 30% 70%, rgba(255,255,255,1) 1px, transparent 0),
                    radial-gradient(2px 2px at 40% 20%, rgba(255,255,255,1) 1px, transparent 0),
                    radial-gradient(2px 2px at 60% 60%, rgba(255,255,255,0.8) 1px, transparent 0),
                    radial-gradient(2px 2px at 70% 30%, rgba(255,255,255,1) 1px, transparent 0),
                    radial-gradient(2px 2px at 80% 80%, rgba(255,255,255,0.8) 1px, transparent 0),
                    radial-gradient(2px 2px at 90% 10%, rgba(255,255,255,1) 1px, transparent 0),
                    linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)
                `,
                        backgroundSize: '550px 550px, 350px 350px, 250px 250px, 150px 150px, 450px 450px, 300px 300px, 200px 200px, 100px 100px, cover',
                        animation: animationsEnabled ? 'moveStars 60s linear infinite' : 'none',
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
                        animation: animationsEnabled ? 'moveLeaves 30s ease-in-out infinite alternate' : 'none',
                    } : {})
                }
            }}
        />
    );
}
