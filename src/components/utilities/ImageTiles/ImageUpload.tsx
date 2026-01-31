"use client";

import React, { useRef } from 'react';
import { Paper, Typography, Stack } from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { Action } from './types';

interface Props {
    dispatch: React.Dispatch<Action>;
}

const ImageUpload: React.FC<Props> = ({ dispatch }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            dispatch({ type: 'SET_IMAGE', payload: file });
        }
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                borderStyle: 'dashed',
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                mt: 2,
            }}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                hidden
            />
            <Stack spacing={1} alignItems="center">
                <CloudUploadRoundedIcon fontSize="large" color="disabled" />
                <Typography variant="body2" fontWeight={500}>
                    Click to upload or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    PNG, JPG, GIF (max 10MB)
                </Typography>
            </Stack>
        </Paper>
    );
};

export default ImageUpload;