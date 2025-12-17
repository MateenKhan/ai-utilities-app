"use client";

import { useState, useEffect } from "react";
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
  Chip
} from "@mui/material";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import SaveAltRoundedIcon from "@mui/icons-material/SaveAltRounded";

export default function HomePage() {
  const [counts, setCounts] = useState({
    todo: 0,
    bookmarks: 0,
    history: 0,
    images: 0
  });

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    const history = JSON.parse(localStorage.getItem("calculatorHistory") || "[]");
    // Image tiles data is stored under 'imageTiles' key
    const images = JSON.parse(localStorage.getItem("imageTiles") || "[]");

    setCounts({
      todo: Array.isArray(todos) ? todos.length : 0,
      bookmarks: Array.isArray(bookmarks) ? bookmarks.length : 0,
      history: Array.isArray(history) ? history.length : 0,
      images: Array.isArray(images) ? images.length : 0,
    });
  }, []);

  const utilities = [
    { id: "todo", label: "Todo List", icon: <ChecklistRoundedIcon />, color: "success.main", count: counts.todo, unit: "tasks" },
    { id: "bookmarks", label: "Bookmarks", icon: <BookmarkBorderRoundedIcon />, color: "primary.main", count: counts.bookmarks, unit: "links" },
    { id: "calculator", label: "Calculator", icon: <CalculateRoundedIcon />, color: "secondary.main", count: counts.history, unit: "calculations" },
    { id: "image-tiles", label: "Image Tiles", icon: <ImageRoundedIcon />, color: "warning.main", count: counts.images, unit: "tiles" },
    { id: "save-load", label: "Save/Load", icon: <SaveAltRoundedIcon />, color: "info.main", count: null },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Airtajal Utilities
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
                    <Typography variant="subtitle1" textAlign="center" fontWeight={600}>
                      {utility.label}
                    </Typography>
                    {utility.count !== null && (
                      <Chip
                        label={`${utility.count} ${utility.unit}`}
                        size="small"
                        variant="outlined"
                        color="default"
                        sx={{ opacity: 0.8 }}
                      />
                    )}
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
