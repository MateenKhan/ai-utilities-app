
import React from 'react';
import { TextField, Grid, InputAdornment, Select, MenuItem, Typography, Stack, Button } from '@mui/material';
import { State, Action } from './types';

interface Props {
    state: State;
    dispatch: React.Dispatch<Action>;
}

const DimensionInputs: React.FC<Props> = ({ state, dispatch }) => {
    const handleDimensionChange = (field: keyof State, value: string) => {
        dispatch({ type: 'SET_DIMENSION', payload: { field, value } });
    };

    const handleUnitChange = (field: 'tileUnit' | 'imageUnit', value: string) => {
        dispatch({ type: 'SET_DIMENSION', payload: { field, value } });
    };

    const handlePresetSize = (preset: 'A4' | 'Letter' | 'Legal') => {
        let width = '';
        let height = '';
        let unit = 'mm';

        if (preset === 'A4') {
            width = '210';
            height = '297';
            unit = 'mm';
        } else if (preset === 'Letter') {
            width = '8.5';
            height = '11';
            unit = 'inches';
        } else if (preset === 'Legal') {
            width = '8.5';
            height = '14';
            unit = 'inches';
        }
        dispatch({ type: 'SET_DIMENSION', payload: { field: 'tileWidth', value: width } });
        dispatch({ type: 'SET_DIMENSION', payload: { field: 'tileHeight', value: height } });
        dispatch({ type: 'SET_DIMENSION', payload: { field: 'tileUnit', value: unit } });
    };

    return (
        <>
            <Typography variant="subtitle2" gutterBottom>
                Physical Image Size
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        label="Width"
                        type="number"
                        value={state.imageWidth}
                        onChange={(e) => handleDimensionChange('imageWidth', e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Select
                                        value={state.imageUnit}
                                        onChange={(e) => handleUnitChange('imageUnit', e.target.value)}
                                        variant="standard"
                                        disableUnderline
                                        sx={{ '& .MuiSelect-select': { py: 0, fontSize: '0.875rem' } }}
                                    >
                                        <MenuItem value="mm">mm</MenuItem>
                                        <MenuItem value="inches">in</MenuItem>
                                    </Select>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Height"
                        type="number"
                        value={state.imageHeight}
                        onChange={(e) => handleDimensionChange('imageHeight', e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Select
                                        value={state.imageUnit}
                                        onChange={(e) => handleUnitChange('imageUnit', e.target.value)}
                                        variant="standard"
                                        disableUnderline
                                        sx={{ '& .MuiSelect-select': { py: 0, fontSize: '0.875rem' } }}
                                    >
                                        <MenuItem value="mm">mm</MenuItem>
                                        <MenuItem value="inches">in</MenuItem>
                                    </Select>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
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
                <Grid item xs={6}>
                    <TextField
                        label="Width"
                        type="number"
                        value={state.tileWidth}
                        onChange={(e) => handleDimensionChange('tileWidth', e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Select
                                        value={state.tileUnit}
                                        onChange={(e) => handleUnitChange('tileUnit', e.target.value)}
                                        variant="standard"
                                        disableUnderline
                                        sx={{ '& .MuiSelect-select': { py: 0, fontSize: '0.875rem' } }}
                                    >
                                        <MenuItem value="mm">mm</MenuItem>
                                        <MenuItem value="inches">in</MenuItem>
                                    </Select>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Height"
                        type="number"
                        value={state.tileHeight}
                        onChange={(e) => handleDimensionChange('tileHeight', e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Select
                                        value={state.tileUnit}
                                        onChange={(e) => handleUnitChange('tileUnit', e.target.value)}
                                        variant="standard"
                                        disableUnderline
                                        sx={{ '& .MuiSelect-select': { py: 0, fontSize: '0.875rem' } }}
                                    >
                                        <MenuItem value="mm">mm</MenuItem>
                                        <MenuItem value="inches">in</MenuItem>
                                    </Select>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default DimensionInputs;