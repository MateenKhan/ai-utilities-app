"use client";

import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stack,
    Divider,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";

interface PrintPreviewModalProps {
    open: boolean;
    onClose: () => void;
    tileData: string;
    tileIndex: number;
    gridPosition: { row: number; col: number };
    totalTiles: { rows: number; cols: number };
}

export default function PrintPreviewModal({
    open,
    onClose,
    tileData,
    tileIndex,
    gridPosition,
    totalTiles,
}: PrintPreviewModalProps) {
    const [scale, setScale] = useState("fit");
    const [paperHandling, setPaperHandling] = useState("auto");
    const [copies, setCopies] = useState(1);

    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        // Determine scale CSS
        let scaleStyle = "";
        if (scale === "100") {
            scaleStyle = "width: auto; height: auto; max-width: 100%; max-height: 100%;";
        } else if (scale === "fit") {
            scaleStyle = "width: 100%; height: auto; max-height: 100%;";
        } else if (scale === "fill") {
            scaleStyle = "width: 100%; height: 100%; object-fit: cover;";
        }

        // Write the print document
        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Tile ${tileIndex + 1}</title>
          <style>
            @media print {
              @page {
                margin: 0;
                size: auto;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              ${scaleStyle}
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${tileData}" alt="Tile ${tileIndex + 1}" />
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            };
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Print Preview - Tile {tileIndex + 1}</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Preview Area */}
                    <Box
                        sx={{
                            border: "2px dashed",
                            borderColor: "divider",
                            borderRadius: 1,
                            p: 2,
                            bgcolor: "background.default",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: 300,
                        }}
                    >
                        <Box
                            component="img"
                            src={tileData}
                            alt={`Tile ${tileIndex + 1}`}
                            sx={{
                                maxWidth: "100%",
                                maxHeight: 400,
                                objectFit: "contain",
                                boxShadow: 3,
                            }}
                        />
                    </Box>

                    {/* Tile Metadata */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Tile Information
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Typography variant="body2" color="text.secondary">
                                <strong>Tile ID:</strong> {tileIndex + 1}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Position:</strong> Row {gridPosition.row + 1}, Col {gridPosition.col + 1}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Grid:</strong> {totalTiles.cols} × {totalTiles.rows}
                            </Typography>
                        </Stack>
                    </Box>

                    <Divider />

                    {/* Print Settings */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Print Settings
                        </Typography>
                        <Stack spacing={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Scale</InputLabel>
                                <Select value={scale} label="Scale" onChange={(e) => setScale(e.target.value)}>
                                    <MenuItem value="100">100% (Actual Size)</MenuItem>
                                    <MenuItem value="fit">Fit to Page</MenuItem>
                                    <MenuItem value="fill">Fill Page</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel>Paper Handling</InputLabel>
                                <Select
                                    value={paperHandling}
                                    label="Paper Handling"
                                    onChange={(e) => setPaperHandling(e.target.value)}
                                >
                                    <MenuItem value="auto">Auto</MenuItem>
                                    <MenuItem value="manual">Manual</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Copies"
                                type="number"
                                size="small"
                                value={copies}
                                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                                InputProps={{ inputProps: { min: 1, max: 99 } }}
                                fullWidth
                            />
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
                    Print
                </Button>
            </DialogActions>
        </Dialog>
    );
}
