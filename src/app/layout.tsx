import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Box, Container, Typography } from "@mui/material";
import { SIDEBAR_WIDTH, APP_BAR_HEIGHT } from "@/components/layoutConstants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Utilities App",
  description: "A collection of useful utilities",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-text`}
      >
        <ThemeProvider>
          <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Header />
            <Sidebar />
            <Box
              component="main"
              sx={{
                ml: { md: `${SIDEBAR_WIDTH}px` },
                pt: `${APP_BAR_HEIGHT}px`,
                px: { xs: 2, md: 4 },
                pb: 4,
              }}
            >
              <Container maxWidth="lg" sx={{ py: 2 }}>
                {children}
              </Container>
            </Box>
            <Box
              component="footer"
              sx={{
                ml: { md: `${SIDEBAR_WIDTH}px` },
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                py: 2,
              }}
            >
              <Container maxWidth="lg">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  display="block"
                >
                  Copyright {new Date().getFullYear()} Utilities App. All rights reserved.
                </Typography>
              </Container>
            </Box>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
