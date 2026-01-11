"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { Slider, IconButton, Tooltip } from "@mui/material";
import PrintPreviewModal from "./PrintPreviewModal";
import JSZip from "jszip";


type StoredImageState = {
  tileWidth?: string;
  tileHeight?: string;
  tileUnit?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageUnit?: string;
  imageData?: string | null;
};

const loadStoredImageState = (): StoredImageState => {
  if (typeof window === "undefined") {
    return {};
  }
  const raw = localStorage.getItem("imageTilesState");
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as StoredImageState;
  } catch {
    return {};
  }
};

const loadStoredTiles = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = localStorage.getItem("imageTiles");
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function ImageTilesContent() {
  const [mounted, setMounted] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [tiles, setTiles] = useState<string[]>([]);
  const [tileWidth, setTileWidth] = useState("210");
  const [tileHeight, setTileHeight] = useState("297");
  const [tileUnit, setTileUnit] = useState("mm");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [imageUnit, setImageUnit] = useState("mm");
  const [overlap, setOverlap] = useState(0.25); // Overlap in inches for print alignment
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [tileCount, setTileCount] = useState({ rows: 0, cols: 0, total: 0 });
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [selectedTile, setSelectedTile] = useState<{ data: string; index: number; row: number; col: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load data from localStorage after mount
  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const initialState = loadStoredImageState();
      const storedTiles = loadStoredTiles();

      if (initialState.imageData) setImage(initialState.imageData);
      if (initialState.tileWidth) setTileWidth(initialState.tileWidth);
      if (initialState.tileHeight) setTileHeight(initialState.tileHeight);
      if (initialState.tileUnit) setTileUnit(initialState.tileUnit);
      if (initialState.imageWidth) setImageWidth(initialState.imageWidth);
      if (initialState.imageHeight) setImageHeight(initialState.imageHeight);
      if (initialState.imageUnit) setImageUnit(initialState.imageUnit);
      if (storedTiles.length > 0) setTiles(storedTiles);
    }
  }, []);

  const calculateTileCount = useCallback((
    imgWidth: number,
    imgHeight: number,
    widthInput = tileWidth,
    heightInput = tileHeight,
    imgWidthInput = imageWidth,
    imgHeightInput = imageHeight
  ) => {
    if (!widthInput || !heightInput || !imgWidthInput || !imgHeightInput) {
      setTileCount({ rows: 0, cols: 0, total: 0 });
      return;
    }

    const tileWidthNum = parseFloat(widthInput);
    const tileHeightNum = parseFloat(heightInput);
    const imageWidthNum = parseFloat(imgWidthInput);
    const imageHeightNum = parseFloat(imgHeightInput);

    if ([tileWidthNum, tileHeightNum, imageWidthNum, imageHeightNum].some((value) => !value || value <= 0)) {
      setTileCount({ rows: 0, cols: 0, total: 0 });
      return;
    }

    const pixelsPerUnitX = imgWidth / imageWidthNum;
    const pixelsPerUnitY = imgHeight / imageHeightNum;

    const tileWidthPx = tileWidthNum * pixelsPerUnitX;
    const tileHeightPx = tileHeightNum * pixelsPerUnitY;

    const cols = Math.ceil(imgWidth / tileWidthPx);
    const rows = Math.ceil(imgHeight / tileHeightPx);

    setTileCount({ rows, cols, total: rows * cols });
  }, [imageHeight, imageWidth, tileHeight, tileWidth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = {
        tileWidth,
        tileHeight,
        tileUnit,
        imageWidth,
        imageHeight,
        imageUnit,
        imageData: image,
        imageFileName: imageFile?.name || null,
      };
      localStorage.setItem("imageTilesState", JSON.stringify(state));
    }
  }, [tileWidth, tileHeight, tileUnit, imageWidth, imageHeight, imageUnit, image, imageFile]);

  useEffect(() => {
    if (!image) {
      return;
    }
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      calculateTileCount(img.width, img.height);
    };
    img.src = image;
  }, [image, calculateTileCount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setError("Please select an image file");
      return;
    }

    setError("");
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setImage(dataUrl);
        setTiles([]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDimensionChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    if (image) {
      const img = new Image();
      img.onload = () => {
        calculateTileCount(img.width, img.height, setter === setTileWidth ? value : tileWidth, setter === setTileHeight ? value : tileHeight, setter === setImageWidth ? value : imageWidth, setter === setImageHeight ? value : imageHeight);
      };
      img.src = image;
    }
  };

  const handlePresetSize = (preset: "A4" | "Letter" | "Legal") => {
    if (preset === "A4") {
      setTileWidth("210");
      setTileHeight("297");
      setTileUnit("mm");
    } else if (preset === "Letter") {
      setTileWidth("8.5");
      setTileHeight("11");
      setTileUnit("inches");
    } else {
      setTileWidth("8.5");
      setTileHeight("14");
      setTileUnit("inches");
    }
  };

  const handleGenerateTiles = () => {
    if (!image) {
      setError("Please upload an image first");
      return;
    }

    if (!tileWidth || !tileHeight || !imageWidth || !imageHeight) {
      setError("Enter both tile and image dimensions");
      return;
    }

    const tileWidthNum = parseFloat(tileWidth);
    const tileHeightNum = parseFloat(tileHeight);
    const imageWidthNum = parseFloat(imageWidth);
    const imageHeightNum = parseFloat(imageHeight);

    if ([tileWidthNum, tileHeightNum, imageWidthNum, imageHeightNum].some((value) => !value || value <= 0)) {
      setError("Use positive numbers for all dimensions");
      return;
    }

    setError("");
    setProcessing(true);

    const process = (img: HTMLImageElement) => {
      const pixelsPerUnitX = img.width / imageWidthNum;
      const pixelsPerUnitY = img.height / imageHeightNum;

      const tileWidthPx = tileWidthNum * pixelsPerUnitX;
      const tileHeightPx = tileHeightNum * pixelsPerUnitY;

      const cols = Math.ceil(img.width / tileWidthPx);
      const rows = Math.ceil(img.height / tileHeightPx);

      const newTiles: string[] = [];
      const canvas = canvasRef.current;
      if (!canvas) {
        setProcessing(false);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setProcessing(false);
        return;
      }

      canvas.width = tileWidthPx;
      canvas.height = tileHeightPx;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const sx = col * tileWidthPx;
          const sy = row * tileHeightPx;
          const sw = Math.min(tileWidthPx, img.width - sx);
          const sh = Math.min(tileHeightPx, img.height - sy);

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          newTiles.push(dataUrl);
        }
      }

      setTiles(newTiles);
      if (typeof window !== 'undefined') {
        localStorage.setItem("imageTiles", JSON.stringify(newTiles));
      }
      setProcessing(false);
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image();
          img.onload = () => process(img);
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(imageFile);
    } else {
      const img = new Image();
      img.onload = () => process(img);
      img.src = image;
    }
  };

  const handleDownloadTile = (dataUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `tile-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    tiles.forEach((tile, index) => {
      setTimeout(() => handleDownloadTile(tile, index), index * 100);
    });
  };

  const handleDownloadAllAsZip = async () => {
    const zip = new JSZip();

    // Add each tile to the ZIP
    tiles.forEach((tile, index) => {
      // Convert base64 to blob
      const base64Data = tile.split(',')[1];
      zip.file(`tile-${index + 1}.jpg`, base64Data, { base64: true });
    });

    // Generate and download the ZIP
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "image-tiles.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPreview = (tileData: string, index: number) => {
    const row = Math.floor(index / tileCount.cols);
    const col = index % tileCount.cols;
    setSelectedTile({ data: tileData, index, row, col });
    setPrintPreviewOpen(true);
  };

  const handleClosePrintPreview = () => {
    setPrintPreviewOpen(false);
    setSelectedTile(null);
  };

  const handleClearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering the file input click
    setImage(null);
    setImageFile(null);
    setImageDimensions({ width: 0, height: 0 });
    setTiles([]);
    setTileWidth("210");
    setTileHeight("297");
    setTileUnit("mm");
    setImageWidth("");
    setImageHeight("");
    setImageUnit("mm");
    setOverlap(0.25);
    setTileCount({ rows: 0, cols: 0, total: 0 });
    setError("");
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem("imageTilesState");
      localStorage.removeItem("imageTiles");
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  return (
    <Box>


      <Typography variant="h5" fontWeight={700} gutterBottom>
        Image Tile Generator
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Split large posters or artwork into printable tiles with precise physical measurements.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Image
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  borderStyle: "dashed",
                  p: { xs: 4, md: 6 }, // Larger touch area on mobile
                  textAlign: "center",
                  cursor: "pointer",
                  minHeight: { xs: 200, md: "auto" }, // Taller target
                  display: "flex", // Centering
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  bgcolor: "background.default"
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <Tooltip title="Delete image and reset">
                      <IconButton
                        size="small"
                        onClick={handleClearAll}
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: -10,
                          bgcolor: "background.paper",
                          boxShadow: 1,
                          "&:hover": { bgcolor: "error.light", color: "error.contrastText" },
                        }}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Box component="img" src={image} alt="Preview" sx={{ maxHeight: 260, objectFit: "contain", width: "100%", borderRadius: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      {imageDimensions.width} × {imageDimensions.height} pixels
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1} alignItems="center">
                    <CloudUploadRoundedIcon fontSize="large" color="disabled" sx={{ fontSize: 48 }} />
                    <Typography variant="body2" fontWeight={500}>Click to upload or drag and drop</Typography>
                    <Typography variant="caption" color="text.secondary">
                      PNG, JPG, GIF (max 10MB)
                    </Typography>
                  </Stack>
                )}
              </Paper>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />

              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Physical Image Size
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      label="Width"
                      type="number"
                      value={imageWidth}
                      onChange={(e) => handleDimensionChange(setImageWidth, e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Height"
                      type="number"
                      value={imageHeight}
                      onChange={(e) => handleDimensionChange(setImageHeight, e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <ToggleButtonGroup
                  value={imageUnit}
                  exclusive
                  onChange={(_e, value) => value && setImageUnit(value)}
                  sx={{ mt: 1 }}
                >
                  <ToggleButton value="mm">Millimeters</ToggleButton>
                  <ToggleButton value="inches">Inches</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Tile Size
                </Typography>
                <Stack direction="row" spacing={1} mb={2}>
                  <Button size="small" variant="outlined" onClick={() => handlePresetSize("A4")}>
                    A4
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => handlePresetSize("Letter")}>
                    Letter
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => handlePresetSize("Legal")}>
                    Legal
                  </Button>
                </Stack>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      label="Width"
                      type="number"
                      value={tileWidth}
                      onChange={(e) => handleDimensionChange(setTileWidth, e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Height"
                      type="number"
                      value={tileHeight}
                      onChange={(e) => handleDimensionChange(setTileHeight, e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <ToggleButtonGroup
                  value={tileUnit}
                  exclusive
                  onChange={(_e, value) => value && setTileUnit(value)}
                  sx={{ mt: 1 }}
                >
                  <ToggleButton value="mm">Millimeters</ToggleButton>
                  <ToggleButton value="inches">Inches</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Overlap (for print alignment)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Add bleed area to help align and tape printed pages together
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Slider
                    value={overlap}
                    onChange={(_e, value) => setOverlap(value as number)}
                    min={0}
                    max={1}
                    step={0.05}
                    marks={[
                      { value: 0, label: '0"' },
                      { value: 0.25, label: '0.25"' },
                      { value: 0.5, label: '0.5"' },
                      { value: 1, label: '1"' },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}"`}
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    {overlap}"
                  </Typography>
                </Stack>
              </Box>

              {tileCount.total > 0 && (
                <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                  <Typography>
                    {tileCount.cols} columns × {tileCount.rows} rows ({tileCount.total} tiles)
                  </Typography>
                </Paper>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, minHeight: 48 }}
                onClick={handleGenerateTiles}
                disabled={processing || !image}
                startIcon={<ImageRoundedIcon />}
              >
                {processing ? "Processing..." : "Generate Tiles"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={2} spacing={1}>
                <Typography variant="h6">Generated Tiles</Typography>
                {tiles.length > 0 && (
                  <Stack direction="row" spacing={1}>
                    <Button startIcon={<DownloadRoundedIcon />} onClick={handleDownloadAll} variant="outlined" size="small">
                      Download All
                    </Button>
                    <Button startIcon={<DownloadRoundedIcon />} onClick={handleDownloadAllAsZip} variant="contained" size="small">
                      Download ZIP
                    </Button>
                  </Stack>
                )}
              </Stack>

              {tiles.length === 0 ? (
                <Stack spacing={1} alignItems="center" py={6} color="text.secondary">
                  <ImageRoundedIcon fontSize="large" />
                  <Typography variant="body2">No tiles generated yet.</Typography>
                </Stack>
              ) : (
                <Grid container spacing={2}>
                  {tiles.map((tile, index) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={index}>
                      <Paper variant="outlined" sx={{ overflow: "hidden", display: "flex", flexDirection: "column", height: '100%' }}>
                        <Box component="img" src={tile} alt={`Tile ${index + 1}`} sx={{ width: "100%", height: 120, objectFit: "cover" }} />
                        <Stack direction="row" spacing={0.5} sx={{ mt: 'auto' }}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon fontSize="small" />}
                            onClick={() => handlePrintPreview(tile, index)}
                            sx={{ minHeight: 44, borderRadius: 0, borderRight: 'none' }}
                          >
                            Print
                          </Button>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadRoundedIcon fontSize="small" />}
                            onClick={() => handleDownloadTile(tile, index)}
                            sx={{ minHeight: 44, borderRadius: 0 }}
                          >
                            Download
                          </Button>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <canvas ref={canvasRef} hidden />

      {selectedTile && (
        <PrintPreviewModal
          open={printPreviewOpen}
          onClose={handleClosePrintPreview}
          tileData={selectedTile.data}
          tileIndex={selectedTile.index}
          gridPosition={{ row: selectedTile.row, col: selectedTile.col }}
          totalTiles={tileCount}
        />
      )}
    </Box>
  );
}
