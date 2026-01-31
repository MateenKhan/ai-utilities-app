"use client";

import React, { useReducer, useCallback } from 'react';
import { Box, Paper, Grid, Typography, Stack, Card } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DimensionInputs from './DimensionInputs';
import ImageUpload from './ImageUpload';
import TileGeneration from './TileGeneration';
import TileDisplay from './TileDisplay';
import { generateTiles } from './utils';
import { imageTilesReducer, initialState } from './state';
import { State, Action } from './types';

const ImageTilesContent: React.FC = () => {
    const [state, dispatch] = useReducer(imageTilesReducer, initialState);

    const handleImageUpload = useCallback((file: File) => {
        dispatch({ type: 'SET_IMAGE', payload: file });

        // Auto-detect image dimensions
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            // Default to A4 if not set, but we also want to set imageWidth/Height 
            // if they are empty
            dispatch({ type: 'SET_DIMENSION', payload: { field: 'imageWidth', value: String(img.naturalWidth) } });
            dispatch({ type: 'SET_DIMENSION', payload: { field: 'imageHeight', value: String(img.naturalHeight) } });
            dispatch({ type: 'SET_DIMENSION', payload: { field: 'imageUnit', value: 'mm' } });
        };
    }, []);

    const handleGenerateTiles = useCallback(() => {
        if (!state.image) {
            console.error("No image selected");
            return;
        }

        const imgWidth = parseFloat(state.imageWidth);
        const imgHeight = parseFloat(state.imageHeight);
        const tWidth = parseFloat(state.tileWidth);
        const tHeight = parseFloat(state.tileHeight);

        if (!imgWidth || !imgHeight || !tWidth || !tHeight) {
            console.error("Missing dimensions", { imgWidth, imgHeight, tWidth, tHeight });
            return;
        }

        dispatch({ type: 'SET_PROCESSING', payload: true });

        const image = new Image();
        image.src = state.imageSrc || URL.createObjectURL(state.image);
        image.onload = () => {
            try {
                const tiles = generateTiles(
                    image,
                    tWidth,
                    tHeight,
                    state.tileUnit,
                    imgWidth,
                    imgHeight,
                    state.imageUnit,
                    state.overlap
                );

                if (tiles.length === 0) {
                    dispatch({ type: 'SET_ERROR', payload: "Could not generate tiles. Please check your dimensions." });
                } else {
                    dispatch({ type: 'SET_TILES', payload: tiles });
                    dispatch({ type: 'SET_ERROR', payload: null });
                }
            } catch (err) {
                console.error("Tile generation error:", err);
                dispatch({ type: 'SET_ERROR', payload: "Generation failed." });
            } finally {
                dispatch({ type: 'SET_PROCESSING', payload: false });
            }
        };
        image.onerror = () => {
            dispatch({ type: 'SET_ERROR', payload: "Failed to load image." });
            dispatch({ type: 'SET_PROCESSING', payload: false });
        };
    }, [state.image, state.imageSrc, state.imageWidth, state.imageHeight, state.tileWidth, state.tileHeight, state.tileUnit, state.imageUnit, state.overlap]);

    const handleMoveTile = useCallback((fromIndex: number, toIndex: number) => {
        dispatch({ type: 'MOVE_TILE', payload: { fromIndex, toIndex } });
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Configuration
                            </Typography>
                            <DimensionInputs state={state} dispatch={dispatch} />
                            <ImageUpload dispatch={dispatch} />
                            <TileGeneration
                                state={state}
                                dispatch={dispatch}
                                onGenerateTiles={handleGenerateTiles}
                            />
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Preview
                            </Typography>
                            <TileDisplay
                                state={state}
                                dispatch={dispatch}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </DndProvider>
    );
};

export default ImageTilesContent;
