"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

import { useNotification } from "@/contexts/NotificationContext";
import { useBookmarks, type Bookmark } from "@/hooks/useBookmarks";

const getDomainFromUrl = (url: string): string => {
  try {
    const urlToParse = url.startsWith("http") ? url : `https://${url}`;
    const domain = new URL(urlToParse).hostname;
    return domain.startsWith("www.") ? domain.substring(4) : domain;
  } catch {
    return url;
  }
};

const getFaviconUrl = (url: string): string => {
  try {
    const urlToParse = url.startsWith("http") ? url : `https://${url}`;
    const domain = new URL(urlToParse).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
};

export default function BookmarksContent() {
  const { bookmarks, loading, addBookmark, updateBookmark } = useBookmarks();
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBookmark, setCurrentBookmark] = useState<Bookmark | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const openModal = (bookmark: Bookmark | null = null) => {
    if (bookmark) {
      setCurrentBookmark(bookmark);
      setName(bookmark.name);
      setUrl(bookmark.url);
    } else {
      setCurrentBookmark(null);
      setName("");
      setUrl("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBookmark(null);
    setName("");
    setUrl("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      showNotification("Name is required", "error");
      return;
    }
    if (!url.trim()) {
      showNotification("URL is required", "error");
      return;
    }

    // Basic Validation: Ensure it at least looks somewhat like a domain or url
    // Relaxed validation: Just needs to adhere to a loose regex or be non-empty string as requested.
    // However, let's at least check for a dot or typical characters if we want meaningful bookmarks.
    // User requested: "urls need not to have the http:// in the validation"

    // We will store exactly what user typed, but for Card href we might prepend https:// if needed

    if (currentBookmark) {
      updateBookmark(currentBookmark.id, { name, url });
      showNotification("Bookmark updated successfully", "success");
    } else {
      addBookmark({ name, url });
      showNotification("Bookmark added successfully", "success");
    }

    closeModal();
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>


      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} mb={4}>
        <Box flexGrow={1}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Bookmarks Manager
          </Typography>
          <Typography color="text.secondary">
            Save quick shortcuts to your favorite sites with automatically fetched favicons.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openModal()}>
          Add Bookmark
        </Button>
      </Stack>

      {bookmarks.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No bookmarks yet
          </Typography>
          <Typography color="text.secondary" paragraph>
            Create your first bookmark to keep important links at your fingertips.
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => openModal()}>
            Add Bookmark
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {bookmarks.map((bookmark) => {
            const faviconUrl = getFaviconUrl(bookmark.url);
            const domain = getDomainFromUrl(bookmark.url);
            const href = bookmark.url.startsWith("http") ? bookmark.url : `https://${bookmark.url}`;

            return (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={bookmark.id}>
                <Card>
                  <CardActionArea
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CardContent>
                      <Stack spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.light", color: "primary.contrastText" }}>
                          {faviconUrl ? (
                            <Box
                              component="img"
                              src={faviconUrl}
                              alt={`${domain} favicon`}
                              sx={{ width: 24, height: 24 }}
                            />
                          ) : (
                            <LinkRoundedIcon />
                          )}
                        </Avatar>
                        <Typography variant="subtitle1" textAlign="center" noWrap sx={{ width: "100%" }}>
                          {bookmark.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ width: "100%" }}>
                          {domain}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>{currentBookmark ? "Edit Bookmark" : "Add Bookmark"}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="URL"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                fullWidth
                required
                helperText="http:// or https:// is optional"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="contained">
              {currentBookmark ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
