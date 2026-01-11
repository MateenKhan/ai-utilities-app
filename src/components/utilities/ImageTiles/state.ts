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
    tiles: { id: string; dataUrl: string }[];
}

export type Action =
    | { type: 'SET_IMAGE'; payload: File }
    | { type: 'SET_DIMENSION'; payload: { field: keyof State; value: string | number } }
    | { type: 'GENERATE_TILES' }
    | { type: 'MOVE_TILE'; payload: { fromIndex: number; toIndex: number } }
    | { type: 'SET_PROCESSING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_TILES'; payload: { id: string; dataUrl: string }[] };

export const initialState: State = {
    image: null,
    imageSrc: null,
    imageWidth: '',
    imageHeight: '',
    imageUnit: 'mm',
    tileWidth: '210',
    tileHeight: '297',
    tileUnit: 'mm',
    overlap: 0.25,
    processing: false,
    error: null,
    tiles: [],
};

export const imageTilesReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'SET_IMAGE':
            return {
                ...state,
                image: action.payload,
                imageSrc: URL.createObjectURL(action.payload),
            };
        case 'SET_DIMENSION':
            return {
                ...state,
                [action.payload.field]: action.payload.value,
            };
        case 'SET_PROCESSING':
            return {
                ...state,
                processing: action.payload,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
            };
        case 'SET_TILES':
            return {
                ...state,
                tiles: action.payload,
            };
        case 'MOVE_TILE': {
            const { fromIndex, toIndex } = action.payload;
            const newTiles = [...state.tiles];
            const [movedTile] = newTiles.splice(fromIndex, 1);
            newTiles.splice(toIndex, 0, movedTile);
            return {
                ...state,
                tiles: newTiles,
            };
        }
        case 'GENERATE_TILES':
            // This will be handled in a useCallback in the component
            // to perform the actual tile generation logic.
            // This action is just a trigger.
            return { ...state };
        default:
            return state;
    }
};