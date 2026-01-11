import { useReducer, useRef, useEffect } from "react";
import { imageTilesReducer, initialState } from "../state";
import { calculateTileCount, generateTiles } from "../utils";
import JSZip from "jszip";

export const useImageTiles = () => {
    const [state, dispatch] = useReducer(imageTilesReducer, initialState);
    const {
        image,
        imageFile,
        tiles,
        tileWidth,
        tileHeight,
        imageWidth,
        imageHeight,
        tileUnit,
        imageUnit,
        overlap,
        tileCount,
    } = state;

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!image) return;
        const img = new Image();
        img.onload = () => {
            dispatch({ type: "SET_IMAGE_DIMENSIONS", payload: { width: img.width, height: img.height } });
            calculateTileCount(state, dispatch, img.width, img.height);
        };
        img.src = image;
    }, [image, state, dispatch]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.match("image.*")) {
            dispatch({ type: "SET_ERROR", payload: "Please select an image file" });
            return;
        }

        dispatch({ type: "SET_ERROR", payload: null });
        dispatch({ type: "SET_IMAGE_FILE", payload: file });

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const dataUrl = event.target.result as string;
                const img = new Image();
                img.onload = () => {
                    dispatch({ type: "SET_IMAGE_WIDTH", payload: (img.width / 96).toFixed(2) });
                    dispatch({ type: "SET_IMAGE_HEIGHT", payload: (img.height / 96).toFixed(2) });
                    dispatch({ type: "SET_IMAGE_UNIT", payload: "inches" });
                    dispatch({ type: "SET_IMAGE", payload: dataUrl });
                    dispatch({ type: "SET_TILES", payload: [] });
                };
                img.src = dataUrl;
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDimensionChange = (
        type:
            | "SET_TILE_WIDTH"
            | "SET_TILE_HEIGHT"
            | "SET_IMAGE_WIDTH"
            | "SET_IMAGE_HEIGHT",
        value: string
    ) => {
        dispatch({ type, payload: value });
    };

    const handleUnitChange = (
        type: "SET_TILE_UNIT" | "SET_IMAGE_UNIT",
        value: string
    ) => {
        dispatch({ type, payload: value });
    };

    const handleOverlapChange = (value: number) => {
        dispatch({ type: "SET_OVERLAP", payload: value });
    };

    const handlePresetSize = (preset: "A4" | "Letter" | "Legal") => {
        if (preset === "A4") {
            dispatch({ type: "SET_TILE_WIDTH", payload: "210" });
            dispatch({ type: "SET_TILE_HEIGHT", payload: "297" });
            dispatch({ type: "SET_TILE_UNIT", payload: "mm" });
        } else if (preset === "Letter") {
            dispatch({ type: "SET_TILE_WIDTH", payload: "8.5" });
            dispatch({ type: "SET_TILE_HEIGHT", payload: "11" });
            dispatch({ type: "SET_TILE_UNIT", payload: "inches" });
        } else {
            dispatch({ type: "SET_TILE_WIDTH", payload: "8.5" });
            dispatch({ type: "SET_TILE_HEIGHT", payload: "14" });
            dispatch({ type: "SET_TILE_UNIT", payload: "inches" });
        }
    };

    const handleGenerateTiles = async () => {
        if (!canvasRef.current) return;

        dispatch({ type: "SET_PROCESSING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

        try {
            const newTiles = await generateTiles(state, canvasRef.current);
            dispatch({ type: "SET_TILES", payload: newTiles });
            localStorage.setItem("imageTiles", JSON.stringify(newTiles));
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: error as string });
        } finally {
            dispatch({ type: "SET_PROCESSING", payload: false });
        }
    };

    const handleDownloadTile = (dataUrl: string, index: number) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `tile-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadAll = () => {
        tiles.forEach((tile, index) => {
            setTimeout(() => handleDownloadTile(tile, index), index * 100);
        });
    };

    const handleDownloadAllAsZip = async () => {
        const zip = new JSZip();
        tiles.forEach((tile, index) => {
            const base64Data = tile.split(",")[1];
            zip.file(`tile-${index + 1}.jpg`, base64Data, { base64: true });
        });
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "image-tiles.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPreview = (tileData: string, index: number) => {
        const row = Math.floor(index / tileCount.cols);
        const col = index % tileCount.cols;
        dispatch({ type: "SET_SELECTED_TILE", payload: { data: tileData, index, row, col } });
        dispatch({ type: "SET_PRINT_PREVIEW_OPEN", payload: true });
    };

    const handleClosePrintPreview = () => {
        dispatch({ type: "SET_PRINT_PREVIEW_OPEN", payload: false });
        dispatch({ type: "SET_SELECTED_TILE", payload: null });
    };

    const handleClearAll = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        dispatch({ type: "RESET_STATE" });
        localStorage.removeItem("imageTilesState");
        localStorage.removeItem("imageTiles");
    };

    const handleSaveToCloud = async () => {
        if (!image) return;
        dispatch({ type: "SET_SAVING", payload: true });
        try {
            const formData = new FormData();
            let fileToUpload = imageFile;
            if (!fileToUpload && image) {
                const res = await fetch(image);
                const blob = await res.blob();
                fileToUpload = new File([blob], "image.png", { type: blob.type });
            }
            if (fileToUpload) {
                formData.append("image", fileToUpload);
            }
            const config = { tileWidth, tileHeight, tileUnit, imageWidth, imageHeight, imageUnit, overlap };
            formData.append("data", JSON.stringify(config));
            const name = imageFile?.name || `Project ${new Date().toLocaleString()}`;
            formData.append("name", name);
            const res = await fetch("/api/image-tiles", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Save failed");
            alert("Project saved to cloud!");
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: "Failed to save to cloud" });
        } finally {
            dispatch({ type: "SET_SAVING", payload: false });
        }
    };

    const handleLoadProject = async (project: any) => {
        try {
            dispatch({ type: "SET_SAVED_PROJECTS_OPEN", payload: false });
            const { data, imageUrl } = project;
            if (data.tileWidth) dispatch({ type: "SET_TILE_WIDTH", payload: data.tileWidth });
            if (data.tileHeight) dispatch({ type: "SET_TILE_HEIGHT", payload: data.tileHeight });
            if (data.tileUnit) dispatch({ type: "SET_TILE_UNIT", payload: data.tileUnit });
            if (data.imageWidth) dispatch({ type: "SET_IMAGE_WIDTH", payload: data.imageWidth });
            if (data.imageHeight) dispatch({ type: "SET_IMAGE_HEIGHT", payload: data.imageHeight });
            if (data.imageUnit) dispatch({ type: "SET_IMAGE_UNIT", payload: data.imageUnit });
            if (data.overlap) dispatch({ type: "SET_OVERLAP", payload: data.overlap });

            if (imageUrl) {
                const res = await fetch(imageUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                dispatch({ type: "SET_IMAGE", payload: url });
                dispatch({ type: "SET_TILES", payload: [] });
                const img = new Image();
                img.onload = () => {
                    dispatch({ type: "SET_IMAGE_DIMENSIONS", payload: { width: img.width, height: img.height } });
                    calculateTileCount(state, dispatch, img.width, img.height);
                };
                img.src = url;
                dispatch({ type: "SET_IMAGE_FILE", payload: null });
            }
        } catch (e) {
            dispatch({ type: "SET_ERROR", payload: "Failed to load project image" });
        }
    };

    const handleLoadFromURL = async (url: string) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const localUrl = URL.createObjectURL(blob);
            dispatch({ type: "SET_IMAGE", payload: localUrl });
            dispatch({ type: "SET_TILES", payload: [] });
            const img = new Image();
            img.onload = () => {
                dispatch({ type: "SET_IMAGE_DIMENSIONS", payload: { width: img.width, height: img.height } });
                dispatch({ type: "SET_IMAGE_WIDTH", payload: (img.width / 96).toFixed(2) });
                dispatch({ type: "SET_IMAGE_HEIGHT", payload: (img.height / 96).toFixed(2) });
                dispatch({ type: "SET_IMAGE_UNIT", payload: "inches" });
                calculateTileCount(state, dispatch, img.width, img.height);
            };
            img.src = localUrl;
            dispatch({ type: "SET_IMAGE_FILE", payload: null });
        } catch (e) {
            dispatch({ type: "SET_ERROR", payload: "Failed to load image from cloud" });
        }
    };

    useEffect(() => {
        const storedState = localStorage.getItem("imageTilesState");
        if (storedState) {
            const parsedState = JSON.parse(storedState);
            Object.keys(parsedState).forEach((key) => {
                dispatch({
                    type: `SET_${key.toUpperCase()}` as any,
                    payload: parsedState[key],
                });
            });
        }
        const storedTiles = localStorage.getItem("imageTiles");
        if (storedTiles) {
            dispatch({ type: "SET_TILES", payload: JSON.parse(storedTiles) });
        }
    }, [dispatch]);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stateToStore = {
                tileWidth,
                tileHeight,
                tileUnit,
                imageWidth,
                imageHeight,
                imageUnit,
                imageData: image,
                imageFileName: imageFile?.name || null,
            };
            localStorage.setItem("imageTilesState", JSON.stringify(stateToStore));
        }
    }, [tileWidth, tileHeight, tileUnit, imageWidth, imageHeight, imageUnit, image, imageFile]);

    return {
        state,
        dispatch,
        canvasRef,
        handleFileChange,
        handleDimensionChange,
        handleUnitChange,
        handleOverlapChange,
        handlePresetSize,
        handleGenerateTiles,
        handleDownloadTile,
        handleDownloadAll,
        handleDownloadAllAsZip,
        handlePrintPreview,
        handleClosePrintPreview,
        handleClearAll,
        handleSaveToCloud,
        handleLoadProject,
        handleLoadFromURL,
    };
};
