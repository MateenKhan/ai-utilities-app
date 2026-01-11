
import React from 'react';
import { Box, Typography, Button, Tooltip, Stack } from '@mui/material';
import { useDrop, useDrag } from 'react-dnd';
import PrintIcon from '@mui/icons-material/Print';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { State, Action, Tile } from './types';

interface DraggableTileProps {
    tile: Tile;
    index: number;
    dispatch: React.Dispatch<Action>;
}

const DraggableTile: React.FC<DraggableTileProps> = ({ tile, index, dispatch }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [, drop] = useDrop({
        accept: 'tile',
        hover(item: { index: number }) {
            if (item.index !== index) {
                dispatch({ type: 'MOVE_TILE', payload: { fromIndex: item.index, toIndex: index } });
                item.index = index;
            }
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'tile',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <Box
            ref={ref}
            sx={{
                opacity: isDragging ? 0 : 1,
                cursor: 'move',
                position: 'relative',
                overflow: 'hidden',
                lineHeight: 0,
                '&:hover .tile-actions': { opacity: 1 },
            }}
        >
            <img
                src={tile.dataUrl}
                alt={`Tile ${index + 1}`}
                style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
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
                    zIndex: 10,
                }}
            >
                <Tooltip title="Print Tile">
                    <Button
                        fullWidth
                        size="small"
                        variant="text"
                        onClick={() => {
                            /* Implement print logic */
                        }}
                        sx={{
                            minHeight: 32,
                            borderRadius: 0,
                            borderRight: 1,
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
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
                        onClick={() => {
                            /* Implement download logic */
                        }}
                        sx={{
                            minHeight: 32,
                            borderRadius: 0,
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
                        }}
                    >
                        <DownloadRoundedIcon fontSize="small" />
                    </Button>
                </Tooltip>
            </Stack>
        </Box>
    );
};

interface Props {
    state: State;
    dispatch: React.Dispatch<Action>;
}

const TileDisplay: React.FC<Props> = ({ state, dispatch }) => {
    if (!state.imageSrc) {
        return (
            <Typography color="text.secondary" align="center">
                Upload an image and generate tiles to see a preview.
            </Typography>
        );
    }

    const gridTemplateColumns = state.image
        ? `repeat(${Math.ceil(
              state.image.width / parseFloat(state.tileWidth)
          )}, 1fr)`
        : '1fr';

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns,
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
            {state.tiles.map((tile, index) => (
                <DraggableTile
                    key={tile.id}
                    tile={tile}
                    index={index}
                    dispatch={dispatch}
                />
            ))}
        </Box>
    );
};

export default TileDisplay;