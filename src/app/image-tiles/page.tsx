"use client";

import { useState, useRef } from "react";
import { FiUpload, FiDownload, FiImage } from "react-icons/fi";

export default function ImageTilesPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [tiles, setTiles] = useState<string[]>([]);
  const [tileWidth, setTileWidth] = useState("210"); // A4 width in mm
  const [tileHeight, setTileHeight] = useState("297"); // A4 height in mm
  const [tileUnit, setTileUnit] = useState("mm");
  const [imageWidth, setImageWidth] = useState(""); // Width of the physical image
  const [imageHeight, setImageHeight] = useState(""); // Height of the physical image
  const [imageUnit, setImageUnit] = useState("mm");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [tileCount, setTileCount] = useState({ rows: 0, cols: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setError("Please select an image file");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        setTiles([]);
        
        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          calculateTileCount(img.width, img.height);
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const calculateTileCount = (imgWidth: number, imgHeight: number) => {
    if (!tileWidth || !tileHeight || !imageWidth || !imageHeight) {
      setTileCount({ rows: 0, cols: 0, total: 0 });
      return;
    }

    const tileWidthNum = parseFloat(tileWidth);
    const tileHeightNum = parseFloat(tileHeight);
    const imageWidthNum = parseFloat(imageWidth);
    const imageHeightNum = parseFloat(imageHeight);

    if (isNaN(tileWidthNum) || isNaN(tileHeightNum) || 
        isNaN(imageWidthNum) || isNaN(imageHeightNum) ||
        tileWidthNum <= 0 || tileHeightNum <= 0 ||
        imageWidthNum <= 0 || imageHeightNum <= 0) {
      setTileCount({ rows: 0, cols: 0, total: 0 });
      return;
    }

    // Calculate pixels per unit for the image
    const pixelsPerUnitX = imgWidth / imageWidthNum;
    const pixelsPerUnitY = imgHeight / imageHeightNum;

    // Convert tile dimensions to pixels
    let tileWidthPx, tileHeightPx;
    if (tileUnit === "mm") {
      tileWidthPx = tileWidthNum * pixelsPerUnitX;
      tileHeightPx = tileHeightNum * pixelsPerUnitY;
    } else {
      // inches
      tileWidthPx = tileWidthNum * pixelsPerUnitX;
      tileHeightPx = tileHeightNum * pixelsPerUnitY;
    }

    // Calculate number of tiles needed
    const cols = Math.ceil(imgWidth / tileWidthPx);
    const rows = Math.ceil(imgHeight / tileHeightPx);
    const total = cols * rows;

    setTileCount({ rows, cols, total });
  };

  const handleGenerateTiles = () => {
    if (!image) {
      setError("Please upload an image first");
      return;
    }

    if (!tileWidth || !tileHeight) {
      setError("Please enter both tile width and height");
      return;
    }

    if (!imageWidth || !imageHeight) {
      setError("Please enter both image width and height");
      return;
    }

    const tileWidthNum = parseFloat(tileWidth);
    const tileHeightNum = parseFloat(tileHeight);
    const imageWidthNum = parseFloat(imageWidth);
    const imageHeightNum = parseFloat(imageHeight);

    if (isNaN(tileWidthNum) || isNaN(tileHeightNum) || 
        isNaN(imageWidthNum) || isNaN(imageHeightNum) ||
        tileWidthNum <= 0 || tileHeightNum <= 0 ||
        imageWidthNum <= 0 || imageHeightNum <= 0) {
      setError("Please enter valid positive numbers for all dimensions");
      return;
    }

    if (tileWidthNum > 10000 || tileHeightNum > 10000) {
      setError("Tile dimensions are too large");
      return;
    }

    setError("");
    setProcessing(true);

    // Create image object
    const img = new Image();
    img.onload = () => {
      // Calculate pixels per unit for the image
      const pixelsPerUnitX = img.width / imageWidthNum;
      const pixelsPerUnitY = img.height / imageHeightNum;

      // Convert tile dimensions to pixels
      let tileWidthPx, tileHeightPx;
      if (tileUnit === "mm") {
        tileWidthPx = tileWidthNum * pixelsPerUnitX;
        tileHeightPx = tileHeightNum * pixelsPerUnitY;
      } else {
        // inches
        tileWidthPx = tileWidthNum * pixelsPerUnitX;
        tileHeightPx = tileHeightNum * pixelsPerUnitY;
      }

      // Calculate number of tiles needed
      const cols = Math.ceil(img.width / tileWidthPx);
      const rows = Math.ceil(img.height / tileHeightPx);

      // Generate tiles
      const newTiles: string[] = [];
      const canvas = canvasRef.current;
      if (!canvas) {
        setProcessing(false);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setProcessing(false);
        return;
      }

      canvas.width = tileWidthPx;
      canvas.height = tileHeightPx;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Fill with white background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image portion
          const sx = col * tileWidthPx;
          const sy = row * tileHeightPx;
          const sw = Math.min(tileWidthPx, img.width - sx);
          const sh = Math.min(tileHeightPx, img.height - sy);

          ctx.drawImage(
            img,
            sx, sy, sw, sh,
            0, 0, sw, sh
          );

          // Get data URL of the tile
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          newTiles.push(dataUrl);
        }
      }

      setTiles(newTiles);
      setProcessing(false);
    };

    img.onerror = () => {
      setError("Failed to load image");
      setProcessing(false);
    };

    img.src = image;
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
      setTimeout(() => {
        handleDownloadTile(tile, index);
      }, index * 500); // Stagger downloads to avoid browser blocking
    });
  };

  const handlePresetSize = (preset: string) => {
    if (preset === "A4") {
      setTileWidth("210");
      setTileHeight("297");
      setTileUnit("mm");
    } else if (preset === "Letter") {
      setTileWidth("8.5");
      setTileHeight("11");
      setTileUnit("inches");
    } else if (preset === "Legal") {
      setTileWidth("8.5");
      setTileHeight("14");
      setTileUnit("inches");
    }
  };

  // Update tile count when inputs change
  const handleDimensionChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (image) {
      const img = new Image();
      img.onload = () => {
        calculateTileCount(img.width, img.height);
      };
      img.src = image;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Image Tile Generator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Image</h2>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Select Image
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {image ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={image} 
                        alt="Preview" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (MAX. 10MB)
                      </p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden" 
                  />
                </label>
              </div>
              
              {image && (
                <div className="mt-2 text-sm text-gray-600">
                  Image dimensions: {imageDimensions.width} × {imageDimensions.height} pixels
                </div>
              )}
            </div>
            
            {image && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Physical Image Size</h2>
                  <p className="text-gray-600 mb-4">
                    Enter the actual dimensions of your printed image
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="imageWidth" className="block text-gray-700 font-medium mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        id="imageWidth"
                        value={imageWidth}
                        onChange={(e) => handleDimensionChange(setImageWidth, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter width"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="imageHeight" className="block text-gray-700 font-medium mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        id="imageHeight"
                        value={imageHeight}
                        onChange={(e) => handleDimensionChange(setImageHeight, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter height"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Unit
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={imageUnit === "mm"}
                          onChange={() => setImageUnit("mm")}
                          className="text-blue-600"
                        />
                        <span className="ml-2">Millimeters (mm)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={imageUnit === "inches"}
                          onChange={() => setImageUnit("inches")}
                          className="text-blue-600"
                        />
                        <span className="ml-2">Inches</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Tile Size</h2>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => handlePresetSize("A4")}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      A4 (210×297mm)
                    </button>
                    <button
                      onClick={() => handlePresetSize("Letter")}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Letter (8.5×11in)
                    </button>
                    <button
                      onClick={() => handlePresetSize("Legal")}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Legal (8.5×14in)
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="tileWidth" className="block text-gray-700 font-medium mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        id="tileWidth"
                        value={tileWidth}
                        onChange={(e) => handleDimensionChange(setTileWidth, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter width"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="tileHeight" className="block text-gray-700 font-medium mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        id="tileHeight"
                        value={tileHeight}
                        onChange={(e) => handleDimensionChange(setTileHeight, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter height"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Unit
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={tileUnit === "mm"}
                          onChange={() => setTileUnit("mm")}
                          className="text-blue-600"
                        />
                        <span className="ml-2">Millimeters (mm)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={tileUnit === "inches"}
                          onChange={() => setTileUnit("inches")}
                          className="text-blue-600"
                        />
                        <span className="ml-2">Inches</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {tileCount.total > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">
                      This will generate <span className="font-bold">{tileCount.total}</span> tiles 
                      ({tileCount.cols} columns × {tileCount.rows} rows)
                    </p>
                  </div>
                )}
              </>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <button
              onClick={handleGenerateTiles}
              disabled={processing || !image || !imageWidth || !imageHeight}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                processing || !image || !imageWidth || !imageHeight
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {processing ? (
                <span>Processing...</span>
              ) : (
                <>
                  <FiImage className="inline mr-2" />
                  Generate Tiles
                </>
              )}
            </button>
          </div>
          
          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Generated Tiles</h2>
              {tiles.length > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  <FiDownload className="mr-1" />
                  Download All
                </button>
              )}
            </div>
            
            {tiles.length === 0 ? (
              <div className="text-center py-12">
                <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tiles generated</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload an image and set dimensions to generate tiles
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Generated {tiles.length} tile{tiles.length !== 1 ? "s" : ""} based on your image
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {tiles.map((tile, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={tile} 
                        alt={`Tile ${index + 1}`} 
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tile {index + 1}</span>
                        <button
                          onClick={() => handleDownloadTile(tile, index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiDownload size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}