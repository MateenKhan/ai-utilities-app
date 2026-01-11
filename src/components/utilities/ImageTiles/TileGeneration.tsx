
import React from 'react';
import { Button } from '@mui/material';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import { State, Action } from './types';

interface Props {
    state: State;
    dispatch: React.Dispatch<Action>;
    onGenerateTiles: () => void;
}

const TileGeneration: React.FC<Props> = ({ state, onGenerateTiles }) => {
    return (
        <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, minHeight: 48 }}
            onClick={onGenerateTiles}
            disabled={state.processing || !state.image}
            startIcon={<ImageRoundedIcon />}
        >
            {state.processing ? 'Processing...' : 'Generate Tiles'}
        </Button>
    );
};

export default TileGeneration;