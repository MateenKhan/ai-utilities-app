"use client";

import { useState, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import UtilityNav from "@/components/UtilityNav";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useTheme } from "@/components/ThemeProvider";

export default function SaveLoadContent() {
  const { themes, currentTheme } = useTheme();
  const [status, setStatus] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAll = useCallback(async () => {
    setIsExporting(true);
    setStatus("Exporting all data...");

    try {
      const zip = new JSZip();
      const themesData = JSON.stringify({ themes, currentThemeId: currentTheme.id });
      zip.file("themes.json", themesData);

      for (const fontUrl of currentTheme.customFonts) {
        try {
          const response = await fetch(fontUrl);
          const fontData = await response.blob();
          const fileName = fontUrl.split("/").pop() || `font-${Date.now()}.css`;
          zip.file(`fonts/${fileName}`, fontData);
        } catch (error) {
          console.error(`Failed to fetch font: ${fontUrl}`, error);
        }
      }

      const bookmarks = localStorage.getItem("bookmarks");
      if (bookmarks) zip.file("bookmarks.json", bookmarks);

      const todos = localStorage.getItem("todos");
      if (todos) {
        zip.file("todos.json", todos);
        const todosData = JSON.parse(todos);
        if (Array.isArray(todosData)) {
          for (const todo of todosData) {
            if (Array.isArray(todo.documents)) {
              for (const doc of todo.documents) {
                try {
                  const response = await fetch(doc.url);
                  const blob = await response.blob();
                  zip.file(`documents/${doc.id}-${doc.name}`, blob);
                } catch (error) {
                  console.error(`Failed to fetch document: ${doc.name}`, error);
                }
              }
            }
          }
        }
      }

      const calculatorState = localStorage.getItem("calculatorState");
      if (calculatorState) zip.file("calculator-state.json", calculatorState);

      const calculatorHistory = localStorage.getItem("calculatorHistory");
      if (calculatorHistory) zip.file("calculator-history.json", calculatorHistory);

      const imageTilesState = localStorage.getItem("imageTilesState");
      if (imageTilesState) zip.file("image-tiles-state.json", imageTilesState);

      const imageTilesData = localStorage.getItem("imageTiles");
      if (imageTilesData) zip.file("image-tiles-data.json", imageTilesData);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "utilities-app-data.zip");
      setStatus("Export completed successfully!");
    } catch (error) {
      console.error("Export failed", error);
      setStatus("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setTimeout(() => setStatus(""), 4000);
    }
  }, [themes, currentTheme]);

  const handleImportAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Importing data...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as ArrayBuffer;
        const zip = await JSZip.loadAsync(content);

        const themesFile = zip.file("themes.json");
        if (themesFile) localStorage.setItem("themesBackup", await themesFile.async("text"));

        const bookmarksFile = zip.file("bookmarks.json");
        if (bookmarksFile) localStorage.setItem("bookmarks", await bookmarksFile.async("text"));

        const todosFile = zip.file("todos.json");
        if (todosFile) {
          const todosData = JSON.parse(await todosFile.async("text"));
          if (Array.isArray(todosData)) {
            for (const todo of todosData) {
              if (Array.isArray(todo.documents)) {
                for (const doc of todo.documents) {
                  const docFile = zip.file(`documents/${doc.id}-${doc.name}`);
                  if (docFile) {
                    const blob = await docFile.async("blob");
                    doc.url = URL.createObjectURL(blob);
                  }
                }
              }
            }
          }
          localStorage.setItem("todos", JSON.stringify(todosData));
        }

        const calculatorStateFile = zip.file("calculator-state.json");
        if (calculatorStateFile) localStorage.setItem("calculatorState", await calculatorStateFile.async("text"));

        const calculatorHistoryFile = zip.file("calculator-history.json");
        if (calculatorHistoryFile) localStorage.setItem("calculatorHistory", await calculatorHistoryFile.async("text"));

        const imageTilesStateFile = zip.file("image-tiles-state.json");
        if (imageTilesStateFile) localStorage.setItem("imageTilesState", await imageTilesStateFile.async("text"));

        const imageTilesDataFile = zip.file("image-tiles-data.json");
        if (imageTilesDataFile) localStorage.setItem("imageTiles", await imageTilesDataFile.async("text"));

        setStatus("Import complete! Reloading...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error("Import failed", error);
        setStatus("Import failed. Please check the file and try again.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }, []);

  return (
    <Box>
      <UtilityNav current="/save-load" />

      <Typography variant="h5" fontWeight={700} gutterBottom>
        Save & Load Data
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Export everything for backup or import data to sync across devices.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Data
              </Typography>
              <Typography color="text.secondary" mb={2}>
                Includes bookmarks, todos (with documents), calculator history, image tiles, and custom themes.
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleExportAll}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Export All Data"}
              </Button>
              <Stack component="ul" sx={{ mt: 2, pl: 3 }} spacing={0.5}>
                <Typography component="li" variant="body2">Bookmarks and tiles</Typography>
                <Typography component="li" variant="body2">Todos with attachments</Typography>
                <Typography component="li" variant="body2">Calculator state & history</Typography>
                <Typography component="li" variant="body2">Custom themes and fonts</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import Data
              </Typography>
              <Typography color="text.secondary" mb={2}>
                Upload a previously exported ZIP file to restore all utilities.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<UploadRoundedIcon />}
                component="label"
              >
                Import ZIP
                <input type="file" hidden accept=".zip" onChange={handleImportAll} />
              </Button>
              <Stack sx={{ mt: 2, pl: 3 }} component="ul" spacing={0.5}>
                <Typography component="li" variant="body2">Replaces existing local data</Typography>
                <Typography component="li" variant="body2">Reloads automatically after import</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {status && (
        <Alert sx={{ mt: 3 }} severity={status.includes("failed") ? "error" : "success"}>
          {status}
        </Alert>
      )}
    </Box>
  );
}
