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
  const initialState = useMemo(() => loadStoredImageState(), []);
  const [image, setImage] = useState<string | null>(initialState.imageData ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [tiles, setTiles] = useState<string[]>(loadStoredTiles);
  const [tileWidth, setTileWidth] = useState(initialState.tileWidth ?? "210");
  const [tileHeight, setTileHeight] = useState(initialState.tileHeight ?? "297");
  const [tileUnit, setTileUnit] = useState(initialState.tileUnit ?? "mm");
  const [imageWidth, setImageWidth] = useState(initialState.imageWidth ?? "");
  const [imageHeight, setImageHeight] = useState(initialState.imageHeight ?? "");
  const [imageUnit, setImageUnit] = useState(initialState.imageUnit ?? "mm");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [tileCount, setTileCount] = useState({ rows: 0, cols: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      localStorage.setItem("imageTiles", JSON.stringify(newTiles));
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
                  <Box>
                    <Box component="img" src={image} alt="Preview" sx={{ maxHeight: 260, objectFit: "contain", width: "100%" }} />
                    <Typography variant="caption" color="text.secondary">
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
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={2}>
                <Typography variant="h6">Generated Tiles</Typography>
                {tiles.length > 0 && (
                  <Button startIcon={<DownloadRoundedIcon />} onClick={handleDownloadAll} variant="outlined">
                    Download All
                  </Button>
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
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadRoundedIcon fontSize="small" />}
                          onClick={() => handleDownloadTile(tile, index)}
                          sx={{ mt: 'auto', minHeight: 44, borderRadius: 0 }}
                        >
                          Tile {index + 1}
                        </Button>
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
    </Box>
  );
}
