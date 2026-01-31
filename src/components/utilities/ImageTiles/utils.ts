// Utility to convert physical units to inches
const toInches = (value: number, unit: 'mm' | 'inches'): number => {
    return unit === 'mm' ? value / 25.4 : value;
};

export const generateTiles = (
    image: HTMLImageElement,
    tileWidth: number,
    tileHeight: number,
    tileUnit: 'mm' | 'inches',
    imageWidth: number,
    imageHeight: number,
    imageUnit: 'mm' | 'inches',
    overlap: number
): { id: string; dataUrl: string }[] => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // 1. Convert everything to inches for consistent math
    const tileW_in = toInches(tileWidth, tileUnit);
    const tileH_in = toInches(tileHeight, tileUnit);
    const imgW_in = toInches(imageWidth, imageUnit);
    const imgH_in = toInches(imageHeight, imageUnit);

    // Safety check
    if (imgW_in <= 0 || imgH_in <= 0 || tileW_in <= 0 || tileH_in <= 0) return [];

    // 2. Calculate PPI (Pixels Per Inch) based on physical image size
    // Note: Use naturalWidth to get the original source pixels
    const ppiX = image.naturalWidth / imgW_in;
    const ppiY = image.naturalHeight / imgH_in;

    // 3. Calculate tile dimensions in source pixels
    const tileW_px = tileW_in * ppiX;
    const tileH_px = tileH_in * ppiY;
    const overlap_px = overlap * Math.min(ppiX, ppiY); // overlap assumed to be in physical units (e.g. inches or mm)

    // Set canvas to tile pixel size
    canvas.width = tileW_px;
    canvas.height = tileH_px;

    // 4. Calculate steps (accounting for overlap)
    const stepX = tileW_px - overlap_px;
    const stepY = tileH_px - overlap_px;

    if (stepX <= 0 || stepY <= 0) return [];

    // 5. Calculate how many tiles we need
    const cols = Math.ceil(image.naturalWidth / stepX);
    const rows = Math.ceil(image.naturalHeight / stepY);

    const tiles: { id: string; dataUrl: string }[] = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const srcX = c * stepX;
            const srcY = r * stepY;

            // Draw portion of image to canvas
            ctx.drawImage(
                image,
                srcX,
                srcY,
                tileW_px,
                tileH_px,
                0,
                0,
                tileW_px,
                tileH_px
            );

            tiles.push({
                id: `${r}-${c}`,
                dataUrl: canvas.toDataURL('image/jpeg', 0.9)
            });
        }
    }

    return tiles;
};

export { toInches };