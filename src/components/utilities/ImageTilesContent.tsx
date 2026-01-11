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
  InputAdornment,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { Slider, IconButton, Tooltip } from "@mui/material";
import PrintPreviewModal from "./PrintPreviewModal";
import SavedProjectsList from "./SavedProjectsList";
import { useAuth } from "@/context/AuthContext";
import SaveIcon from "@mui/icons-material/Save";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
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
  const [savedProjectsOpen, setSavedProjectsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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
    imgWidth: number, // natural pixels
    imgHeight: number, // natural pixels
    widthInput = tileWidth,
    heightInput = tileHeight,
    imgWidthInput = imageWidth,
    imgHeightInput = imageHeight
  ) => {
    if (!widthInput || !heightInput || !imgWidthInput || !imgHeightInput) {
      setTileCount({ rows: 0, cols: 0, total: 0 });
      return;
    }

    const rawTileWidth = parseFloat(widthInput);
    const rawTileHeight = parseFloat(heightInput);
    const rawImageWidth = parseFloat(imgWidthInput);
    const rawImageHeight = parseFloat(imgHeightInput);

    if ([rawTileWidth, rawTileHeight, rawImageWidth, rawImageHeight].some((v) => !v || v <= 0)) {
      setTileCount({ rows: 0, cols: 0, total: 0 });
      return;
    }

    // Helper to convert to inches (assuming access to current state units)
    // Note: The callback usually uses current state for units unless passed as args.
    // Ideally we should pass units too, but for now we use state `tileUnit` and `imageUnit`
    // which are in the dependency array below.
    const toInches = (val: number, unit: string) => (unit === "mm" ? val / 25.4 : val);

    const tileW_in = toInches(rawTileWidth, tileUnit);
    const tileH_in = toInches(rawTileHeight, tileUnit);
    const imgW_in = toInches(rawImageWidth, imageUnit);
    const imgH_in = toInches(rawImageHeight, imageUnit);

    // Safety check for overlap
    if (overlap >= tileW_in || overlap >= tileH_in) {
      // Cannot calculate valid count if overlap consumes the whole tile
      setTileCount({ rows: 0, cols: 0, total: 0 });
      return;
    }

    // 1. Calculate PPI
    const ppiX = imgWidth / imgW_in;
    const ppiY = imgHeight / imgH_in;

    // 2. Calculate Step Size (Tile - Overlap)
    const stepX = (tileW_in - overlap) * ppiX;
    const stepY = (tileH_in - overlap) * ppiY;

    // 3. Calculate Grid
    const cols = Math.ceil(imgWidth / stepX);
    const rows = Math.ceil(imgHeight / stepY);

    setTileCount({ rows, cols, total: rows * cols });
  }, [tileUnit, imageUnit, overlap, tileWidth, tileHeight, imageWidth, imageHeight]);

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

        // Load image to get dimensions for auto-population
        const img = new Image();
        img.onload = () => {
          // Auto-populate inputs assuming 96 DPI
          setImageWidth((img.width / 96).toFixed(2));
          setImageHeight((img.height / 96).toFixed(2));
          setImageUnit("inches");

          setImage(dataUrl);
          setTiles([]);
        };
        img.src = dataUrl;
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

    // Convert string inputs to numbers
    const rawTileWidth = parseFloat(tileWidth);
    const rawTileHeight = parseFloat(tileHeight);
    const rawImageWidth = parseFloat(imageWidth);
    const rawImageHeight = parseFloat(imageHeight);

    if ([rawTileWidth, rawTileHeight, rawImageWidth, rawImageHeight].some((v) => !v || v <= 0)) {
      setError("Use positive numbers for all dimensions");
      return;
    }

    // Normalize everything to INCHES
    const toInches = (val: number, unit: string) => (unit === "mm" ? val / 25.4 : val);

    const tileW_in = toInches(rawTileWidth, tileUnit);
    const tileH_in = toInches(rawTileHeight, tileUnit);
    const imgW_in = toInches(rawImageWidth, imageUnit);
    const imgH_in = toInches(rawImageHeight, imageUnit);

    // Overlap is already in inches
    const overlap_in = overlap;

    // Safety check: Overlap shouldn't be larger than the tile itself
    if (overlap_in >= tileW_in || overlap_in >= tileH_in) {
      setError("Overlap must be smaller than the tile size");
      return;
    }

    setError("");
    setProcessing(true);

    // Use a small timeout to allow UI to update (show processing state)
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
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

        // 1. Calculate PPI (Pixels Per Inch)
        // We match the image's natural pixels to the target physical size
        const ppiX = img.naturalWidth / imgW_in;
        const ppiY = img.naturalHeight / imgH_in;

        // 2. Calculate Tile Size in Pixels (Canvas Size)
        // The canvas will represent one physical page (e.g., A4)
        const canvasWidth = tileW_in * ppiX;
        const canvasHeight = tileH_in * ppiY;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 3. Calculate Step Size (how much we move across the source image)
        // We step by the printable area (Tile Size - Overlap)
        const stepX = (tileW_in - overlap_in) * ppiX;
        const stepY = (tileH_in - overlap_in) * ppiY;

        // 4. Calculate Grid
        const cols = Math.ceil(img.naturalWidth / stepX);
        const rows = Math.ceil(img.naturalHeight / stepY);

        const newTiles: string[] = [];

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Source rectangle (where to take from the original image)
            const srcX = col * stepX;
            const srcY = row * stepY;

            // Draw the portion of the image onto the canvas
            // We draw the full canvas size (including overlap area)
            ctx.drawImage(
              img,
              srcX,
              srcY,
              canvasWidth,
              canvasHeight, // Source size (in source pixels)
              0,
              0,
              canvasWidth,
              canvasHeight // Destination size (1:1 map)
            );

            // Add alignment guides (optional but helpful)
            // Draw simple corner ticks to show where the useful area is (minus overlap)
            // But for now, let's keep it clean like the reference or add simple border?
            // The reference implementation had guides. Let's stick to the generated image for now.

            // Export to base64
            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            newTiles.push(dataUrl);
          }
        }

        setTiles(newTiles);
        if (typeof window !== 'undefined') {
          localStorage.setItem("imageTiles", JSON.stringify(newTiles));
        }
        setProcessing(false);
        // Scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      };

      img.onerror = () => {
        setError("Failed to load image for processing");
        setProcessing(false);
      };

      if (imageFile) {
        // If we have the file object, use FileReader to be safe (or createObjectURL)
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) img.src = e.target.result as string;
        };
        reader.readAsDataURL(imageFile);
      } else {
        // Fallback to the stored data URL
        img.src = image!;
      }
    }, 100);
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

  const handleSaveToCloud = async () => {
    if (!image) return;
    setSaving(true);
    try {
      const formData = new FormData();

      let fileToUpload = imageFile;
      if (!fileToUpload && image) {
        try {
          const res = await fetch(image);
          const blob = await res.blob();
          fileToUpload = new File([blob], "image.png", { type: blob.type });
        } catch (e) { console.error(e); }
      }

      if (fileToUpload) {
        formData.append('image', fileToUpload);
      }

      const config = {
        tileWidth, tileHeight, tileUnit,
        imageWidth, imageHeight, imageUnit,
        overlap
      };

      formData.append('data', JSON.stringify(config));
      const name = imageFile?.name || `Project ${new Date().toLocaleString()}`;
      formData.append('name', name);

      const res = await fetch('/api/image-tiles', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Save failed');
      alert('Project saved to cloud!');
    } catch (error) {
      console.error(error);
      setError('Failed to save to cloud');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadProject = async (project: any) => {
    try {
      setSavedProjectsOpen(false);
      const { data, imageUrl } = project;

      if (data.tileWidth) setTileWidth(data.tileWidth);
      if (data.tileHeight) setTileHeight(data.tileHeight);
      if (data.tileUnit) setTileUnit(data.tileUnit);
      if (data.imageWidth) setImageWidth(data.imageWidth);
      if (data.imageHeight) setImageHeight(data.imageHeight);
      if (data.imageUnit) setImageUnit(data.imageUnit);
      if (data.overlap) setOverlap(data.overlap);

      if (imageUrl) {
        try {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setImage(url);
          setTiles([]);
          const img = new Image();
          img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
            calculateTileCount(img.width, img.height, data.tileWidth, data.tileHeight);
          };
          img.src = url;
          setImageFile(null);
        } catch (e) {
          console.error('Failed to load image blob', e);
          setError('Failed to load project image');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };


  return (
    <Box>


      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Image Tile Generator
          </Typography>
          <Typography color="text.secondary">
            Split large posters or artwork into printable tiles with precise physical measurements.
          </Typography>
        </Box>
        {user && (
          <Button
            startIcon={<LibraryBooksIcon />}
            onClick={() => setSavedProjectsOpen(true)}
            variant="outlined"
          >
            My Saved Projects
          </Button>
        )}
      </Stack>

      <SavedProjectsList
        open={savedProjectsOpen}
        onClose={() => setSavedProjectsOpen(false)}
        onLoad={handleLoadProject}
      />

      <Grid container spacing={4} direction="column" alignItems="center">
        <Grid size={{ xs: 12, md: 10, lg: 8 }} sx={{ width: '100%' }}>
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
                    <Stack direction="row" spacing={1} sx={{ position: "absolute", top: -10, right: -10, zIndex: 10 }}>
                      {user && (
                        <Tooltip title="Save to Cloud">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleSaveToCloud(); }}
                            disabled={saving}
                            sx={{
                              bgcolor: "background.paper",
                              boxShadow: 1,
                              "&:hover": { bgcolor: "primary.light", color: "primary.contrastText" },
                            }}
                          >
                            {saving ? <CircularProgress size={20} /> : <SaveIcon fontSize="small" color="primary" />}
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete image and reset">
                        <IconButton
                          size="small"
                          onClick={handleClearAll}
                          sx={{
                            bgcolor: "background.paper",
                            boxShadow: 1,
                            "&:hover": { bgcolor: "error.light", color: "error.contrastText" },
                          }}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
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
                  {imageDimensions.width > 0 && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 'normal' }}>
                      (Native: {(imageDimensions.width / 96).toFixed(1)}&quot; × {(imageDimensions.height / 96).toFixed(1)}&quot;)
                    </Typography>
                  )}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      label="Width"
                      type="number"
                      value={imageWidth}
                      onChange={(e) => handleDimensionChange(setImageWidth, e.target.value)}
                      fullWidth
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <Select
                                value={imageUnit}
                                onChange={(e) => setImageUnit(e.target.value)}
                                variant="standard"
                                disableUnderline
                                sx={{ '& .MuiSelect-select': { py: 0, fontSize: '0.875rem' } }}
                              >
                                <MenuItem value="mm">mm</MenuItem>
                                <MenuItem value="inches">in</MenuItem>
                              </Select>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Height"
                      type="number"
                      value={imageHeight}
                      onChange={(e) => handleDimensionChange(setImageHeight, e.target.value)}
                      fullWidth
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <Select
                                value={imageUnit}
                                onChange={(e) => setImageUnit(e.target.value)}
                                variant="standard"
                                disableUnderline
                                sx={{ '& .MuiSelect-select': { py: 0, fontSize: '0.875rem' } }}
                              >
                                <MenuItem value="mm">mm</MenuItem>
                                <MenuItem value="inches">in</MenuItem>
                              </Select>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                </Grid>
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
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <Select
                                value={tileUnit}
                                onChange={(e) => setTileUnit(e.target.value)}
                                variant="standard"
                                disableUnderline
                                sx={{ '& .MuiSelect-select': { py: 0, fontSize: '0.875rem' } }}
                              >
                                <MenuItem value="mm">mm</MenuItem>
                                <MenuItem value="inches">in</MenuItem>
                              </Select>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Height"
                      type="number"
                      value={tileHeight}
                      onChange={(e) => handleDimensionChange(setTileHeight, e.target.value)}
                      fullWidth
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <Select
                                value={tileUnit}
                                onChange={(e) => setTileUnit(e.target.value)}
                                variant="standard"
                                disableUnderline
                                sx={{ '& .MuiSelect-select': { py: 0, fontSize: '0.875rem' } }}
                              >
                                <MenuItem value="mm">mm</MenuItem>
                                <MenuItem value="inches">in</MenuItem>
                              </Select>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                </Grid>
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

        {tiles.length > 0 && (
          <Grid size={{ xs: 12, md: 10, lg: 8 }} sx={{ width: '100%' }} ref={resultsRef}>
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
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${tileCount.cols}, 1fr)`,
                      gap: 0,
                      width: '100%',
                      maxWidth: '100%',
                      margin: '0 auto',
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      fontSize: 0,
                    }}
                  >
                    {tiles.map((tile, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover .tile-actions': { opacity: 1 },
                          lineHeight: 0, // Prevent extra space for inline images
                          // Thin border for clarity
                          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                          transition: 'box-shadow 0.2s, z-index 0s',
                          '&:hover': {
                            boxShadow: 'inset 0 0 0 2px #3b82f6', // Blue glow on hover
                            zIndex: 1, // Bring to front
                          }
                        }}
                      >
                        <img
                          src={tile}
                          alt={`Tile ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                          }}
                        />
                        <Stack
                          className="tile-actions"
                          direction="row"
                          spacing={0}
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(2px)',
                            borderTop: 1,
                            borderColor: 'divider',
                            opacity: 0,
                            transition: 'opacity 0.2s ease-in-out',
                            zIndex: 10
                          }}
                        >
                          <Tooltip title="Print Tile">
                            <Button
                              fullWidth
                              size="small"
                              variant="text"
                              onClick={() => handlePrintPreview(tile, index)}
                              sx={{
                                minHeight: 32,
                                borderRadius: 0,
                                borderRight: 1,
                                borderColor: 'divider',
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main', bgcolor: 'action.hover' }
                              }}
                            >
                              <PrintIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                          <Tooltip title="Download Tile">
                            <Button
                              fullWidth
                              size="small"
                              variant="text"
                              onClick={() => handleDownloadTile(tile, index)}
                              sx={{
                                minHeight: 32,
                                borderRadius: 0,
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main', bgcolor: 'action.hover' }
                              }}
                            >
                              <DownloadRoundedIcon fontSize="small" />
                            </Button>
                          </Tooltip>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
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
