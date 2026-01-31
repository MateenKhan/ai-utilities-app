export interface Tile {
    id: string;
    dataUrl: string;
}

export interface State {
    image: File | null;
    imageSrc: string | null;
    imageWidth: string;
    imageHeight: string;
    imageUnit: 'mm' | 'inches';
    tileWidth: string;
    tileHeight: string;
    tileUnit: 'mm' | 'inches';
    overlap: number;
    processing: boolean;
    error: string | null;
    tiles: Tile[];
}

export type Action =
    | { type: 'SET_IMAGE'; payload: File }
    | { type: 'SET_DIMENSION'; payload: { field: keyof State; value: string | number } }
    | { type: 'GENERATE_TILES' }
    | { type: 'MOVE_TILE'; payload: { fromIndex: number; toIndex: number } }
    | { type: 'SET_PROCESSING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_TILES'; payload: { id: string; dataUrl: string }[] };