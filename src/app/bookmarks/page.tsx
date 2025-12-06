"use client";

import { useState } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave } from "react-icons/fi";
import { useBookmarks, type Bookmark } from "@/hooks/useBookmarks";

export default function BookmarksPage() {
  const { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark } = useBookmarks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBookmark, setCurrentBookmark] = useState<Bookmark | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const openModal = (bookmark: Bookmark | null = null) => {
    if (bookmark) {
      setCurrentBookmark(bookmark);
      setName(bookmark.name);
      setUrl(bookmark.url);
    } else {
      setCurrentBookmark(null);
      setName("");
      setUrl("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBookmark(null);
    setName("");
    setUrl("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) return;
    
    if (currentBookmark) {
      // Update existing bookmark
      updateBookmark(currentBookmark.id, { name, url });
    } else {
      // Add new bookmark
      addBookmark({ name, url });
    }
    
    closeModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading bookmarks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bookmarks Manager</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Bookmark
          </button>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookmarks yet</h2>
            <p className="text-gray-500 mb-4">Add your first bookmark to get started</p>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              <FiPlus className="inline mr-2" />
              Add Bookmark
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">{bookmark.name}</h2>
                  <p className="text-gray-600 mb-4 break-all text-sm">{bookmark.url}</p>
                  <div className="flex justify-between">
                    <a 
                      href={bookmark.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Visit
                    </a>
                    <div className="space-x-2">
                      <button
                        onClick={() => openModal(bookmark)}
                        className="text-gray-500 hover:text-blue-600"
                        aria-label="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="text-gray-500 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for adding/editing bookmarks */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentBookmark ? "Edit Bookmark" : "Add Bookmark"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter bookmark name"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="url" className="block text-gray-700 font-medium mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                  >
                    <FiSave className="mr-2" />
                    {currentBookmark ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}