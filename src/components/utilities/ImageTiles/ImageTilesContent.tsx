
import React, { useReducer, useCallback } from 'react';
import { Box, Paper, Grid, Typography, Stack, Card } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    DimensionInputs,
    ImageUpload,
    TileGeneration,
    TileDisplay,
    generateTiles,
} from './';
import { imageTilesReducer, initialState } from './state';

const ImageTilesContent: React.FC = () => {
    const [state, dispatch] = useReducer(imageTilesReducer, initialState);

    const handleImageUpload = useCallback((file: File) => {
        dispatch({ type: 'SET_IMAGE', payload: file });
    }, []);

    const handleGenerateTiles = useCallback(() => {
        if (!state.image) {
            return;
        }
        dispatch({ type: 'SET_PROCESSING', payload: true });
        const image = new Image();
        image.src = URL.createObjectURL(state.image);
        image.onload = () => {
            const tiles = generateTiles(
                image,
                parseFloat(state.tileWidth),
                parseFloat(state.tileHeight),
                state.tileUnit,
                parseFloat(state.imageWidth),
                parseFloat(state.imageHeight),
                state.imageUnit,
                state.overlap
            );
            dispatch({ type: 'SET_TILES', payload: tiles });
            dispatch({ type: 'SET_PROCESSING', payload: false });
        };
    }, [state.image, state.tileWidth, state.tileHeight, state.tileUnit, state.imageWidth, state.imageHeight, state.imageUnit, state.overlap]);

    const handleMoveTile = useCallback((fromIndex: number, toIndex: number) => {
        dispatch({ type: 'MOVE_TILE', payload: { fromIndex, toIndex } });
    }, []);

    return (
        <DndProvider backend={HTML5Backend}>
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Configuration
                            </Typography>
                            <DimensionInputs state={state} dispatch={dispatch} />
                            <ImageUpload onImageUpload={handleImageUpload} />
                            <TileGeneration
                                onGenerateTiles={handleGenerateTiles}
                                processing={state.processing}
                                image={state.imageSrc}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Preview
                            </Typography>
                            <TileDisplay
                                tiles={state.tiles}
                                onMoveTile={handleMoveTile}
                                imageSrc={state.imageSrc}
                                tileWidth={parseFloat(state.tileWidth)}
                                tileHeight={parseFloat(state.tileHeight)}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </DndProvider>
    );
};

export default ImageTilesContent;
