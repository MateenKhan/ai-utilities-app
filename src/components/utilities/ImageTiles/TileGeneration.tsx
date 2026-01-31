"use client";

import React from 'react';
import { Button, Typography, Stack } from '@mui/material';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import { State, Action } from './types';

interface Props {
    state: State;
    dispatch: React.Dispatch<Action>;
    onGenerateTiles: () => void;
}

const TileGeneration: React.FC<Props> = ({ state, onGenerateTiles }) => {
    return (
        <Stack spacing={2} sx={{ mt: 3 }}>
            {state.error && (
                <Typography color="error" variant="caption" align="center">
                    {state.error}
                </Typography>
            )}
            <Button
                variant="contained"
                fullWidth
                sx={{ minHeight: 48 }}
                onClick={onGenerateTiles}
                disabled={state.processing || !state.image}
                startIcon={<ImageRoundedIcon />}
            >
                {state.processing ? 'Processing...' : 'Generate Tiles'}
            </Button>
        </Stack>
    );
};

export default TileGeneration;