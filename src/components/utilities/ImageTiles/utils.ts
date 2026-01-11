export const toInches = (value: number, unit: 'mm' | 'inches'): number => {
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
    if (!ctx) {
        return [];
    }

    const tileW_in = toInches(tileWidth, tileUnit);
    const tileH_in = toInches(tileHeight, tileUnit);
    const imgW_in = toInches(imageWidth, imageUnit);
    const imgH_in = toInches(imageHeight, imageUnit);
    const overlap_in = overlap;

    if (overlap_in >= tileW_in || overlap_in >= tileH_in) {
        return [];
    }

    const ppiX = image.naturalWidth / imgW_in;
    const ppiY = image.naturalHeight / imgH_in;

    const canvasWidth = tileW_in * ppiX;
    const canvasHeight = tileH_in * ppiY;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const stepX = (tileW_in - overlap_in) * ppiX;
    const stepY = (tileH_in - overlap_in) * ppiY;

    const cols = Math.ceil(image.naturalWidth / stepX);
    const rows = Math.ceil(image.naturalHeight / stepY);

    const newTiles: { id: string; dataUrl: string }[] = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const srcX = col * stepX;
            const srcY = row * stepY;

            ctx.drawImage(
                image,
                srcX,
                srcY,
                canvasWidth,
                canvasHeight,
                0,
                0,
                canvasWidth,
                canvasHeight
            );

            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            newTiles.push({ id: `${row}-${col}`, dataUrl });
        }
    }

    return newTiles;
};