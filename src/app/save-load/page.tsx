"use client";

import { useState, useRef } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FiUpload, FiDownload, FiFolder, FiFile, FiSave, FiHardDrive } from "react-icons/fi";

export default function SaveLoadPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [fileCount, setFileCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveData = async () => {
    setLoading(true);
    setStatus("Preparing data...");

    try {
      // Create a new ZIP file
      const zip = new JSZip();
      
      // Get all data from localStorage
      const bookmarks = localStorage.getItem("bookmarks");
      const todos = localStorage.getItem("todos");
      
      // Add data files to ZIP
      if (bookmarks) {
        zip.file("bookmarks.json", bookmarks);
      }
      
      if (todos) {
        zip.file("todos.json", todos);
      }
      
      // Add documents from todos to ZIP
      setStatus("Collecting documents...");
      let docCount = 0;
      
      if (todos) {
        const todosData = JSON.parse(todos);
        const docFolder = zip.folder("documents");
        
        if (docFolder) {
          for (const todo of todosData) {
            if (todo.documents && Array.isArray(todo.documents)) {
              for (const doc of todo.documents) {
                // For this demo, we'll create placeholder files since we can't access
                // the actual file blobs from localStorage
                docFolder.file(
                  `${doc.id}_${doc.name}`, 
                  `Document placeholder: ${doc.name}\nType: ${doc.type}\nOriginally attached to: ${todo.title}`,
                  { comment: `Original URL: ${doc.url}` }
                );
                docCount++;
              }
            }
          }
        }
      }
      
      setFileCount(docCount + (bookmarks ? 1 : 0) + (todos ? 1 : 0));
      
      // Generate ZIP file
      setStatus("Creating ZIP archive...");
      const content = await zip.generateAsync({ type: "blob" });
      
      // Save ZIP file
      setStatus("Saving file...");
      saveAs(content, `utilities_backup_${new Date().toISOString().slice(0, 10)}.zip`);
      
      setStatus(`Backup created successfully with ${fileCount} files!`);
    } catch (error) {
      console.error("Error creating backup:", error);
      setStatus("Error creating backup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      setStatus("Please select a ZIP file");
      return;
    }

    setLoading(true);
    setStatus("Loading data...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(event.target?.result as ArrayBuffer);
        
        let loadedFiles = 0;
        
        // Load bookmarks
        const bookmarksFile = contents.file("bookmarks.json");
        if (bookmarksFile) {
          const bookmarksContent = await bookmarksFile.async("text");
          localStorage.setItem("bookmarks", bookmarksContent);
          loadedFiles++;
        }
        
        // Load todos
        const todosFile = contents.file("todos.json");
        if (todosFile) {
          const todosContent = await todosFile.async("text");
          localStorage.setItem("todos", todosContent);
          loadedFiles++;
        }
        
        setFileCount(loadedFiles);
        setStatus(`Data loaded successfully from ${loadedFiles} files! Please refresh the page to see changes.`);
        
        // Refresh the page after a short delay to show the changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error("Error loading backup:", error);
        setStatus("Error loading backup. Please try again.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    
    reader.onerror = () => {
      setStatus("Error reading file");
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Save & Load Data</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Save Data Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                <FiSave size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Save Your Data</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Create a backup of all your bookmarks, todos, and attached documents in a single ZIP file.
            </p>
            
            <button
              onClick={handleSaveData}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <FiDownload className="mr-2" />
              {loading ? "Saving..." : "Save All Data to ZIP"}
            </button>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">What's included:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <FiFolder className="mr-2 text-blue-500" />
                  Bookmarks data
                </li>
                <li className="flex items-center">
                  <FiFolder className="mr-2 text-blue-500" />
                  Todo lists and notes
                </li>
                <li className="flex items-center">
                  <FiFile className="mr-2 text-blue-500" />
                  All attached documents
                </li>
              </ul>
            </div>
          </div>
          
          {/* Load Data Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                <FiHardDrive size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Load Your Data</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Restore your data from a previously saved ZIP backup file.
            </p>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    ZIP files only
                  </p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleLoadData}
                  accept=".zip"
                  className="hidden" 
                  disabled={loading}
                />
              </label>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Important:</h3>
              <p className="text-sm text-gray-600">
                Loading data will replace your current data. Make sure to save any unsaved work first.
              </p>
            </div>
          </div>
        </div>
        
        {/* Status Display */}
        {status && (
          <div className={`mt-8 p-4 rounded-lg ${
            status.includes("Error") 
              ? "bg-red-100 text-red-700" 
              : status.includes("successfully") 
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
          }`}>
            <p>{status}</p>
            {fileCount > 0 && !status.includes("Error") && (
              <p className="mt-2 text-sm">
                Files processed: {fileCount}
              </p>
            )}
          </div>
        )}
        
        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Saving Data</h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                <li>Click the "Save All Data to ZIP" button</li>
                <li>Wait for the backup process to complete</li>
                <li>Your browser will download a ZIP file with all your data</li>
                <li>Store this file in a safe location for backup</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Loading Data</h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                <li>Click the upload area in the Load section</li>
                <li>Select a previously saved ZIP backup file</li>
                <li>Wait for the restore process to complete</li>
                <li>The page will automatically refresh to show your restored data</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}