"use client";

import Link from "next/link";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import SaveAltRoundedIcon from "@mui/icons-material/SaveAltRounded";

const utilities = [
  { id: "bookmarks", label: "Bookmarks", icon: <BookmarkBorderRoundedIcon />, color: "primary.main" },
  { id: "calculator", label: "Calculator", icon: <CalculateRoundedIcon />, color: "secondary.main" },
  { id: "todo", label: "Todo List", icon: <ChecklistRoundedIcon />, color: "success.main" },
  { id: "image-tiles", label: "Image Tiles", icon: <ImageRoundedIcon />, color: "warning.main" },
  { id: "save-load", label: "Save/Load", icon: <SaveAltRoundedIcon />, color: "info.main" },
];

export default function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Utilities App
        </Typography>
        <Typography color="text.secondary">
          Choose a tool to get started
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {utilities.map((utility) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={utility.id}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardActionArea
                component={Link}
                href={`/${utility.id}`}
                sx={{ height: "100%" }}
              >
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: utility.color, color: "common.white", width: 48, height: 48 }}>
                      {utility.icon}
                    </Avatar>
                    <Typography variant="subtitle1" textAlign="center">
                      {utility.label}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
