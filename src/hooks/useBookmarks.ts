import { useState, useEffect } from 'react';

export type Bookmark = {
  id: string;
  name: string;
  url: string;
};

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookmarks from localStorage
  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const savedBookmarks = localStorage.getItem('bookmarks');
        if (savedBookmarks) {
          const parsedBookmarks = JSON.parse(savedBookmarks);
          // Validate that we have an array of bookmarks
          if (Array.isArray(parsedBookmarks) && parsedBookmarks.every(isValidBookmark)) {
            setBookmarks(parsedBookmarks);
          } else {
            // If data is corrupted, clear it
            localStorage.removeItem('bookmarks');
            setBookmarks([]);
          }
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
        // If there's an error, clear the corrupted data
        localStorage.removeItem('bookmarks');
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookmarks' && e.newValue !== null) {
        try {
          const parsedBookmarks = JSON.parse(e.newValue);
          if (Array.isArray(parsedBookmarks) && parsedBookmarks.every(isValidBookmark)) {
            setBookmarks(parsedBookmarks);
          }
        } catch (error) {
          console.error('Failed to parse bookmarks from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      } catch (error) {
        console.error('Failed to save bookmarks:', error);
      }
    }
  }, [bookmarks, loading]);

  // Validate bookmark structure
  const isValidBookmark = (bookmark: unknown): bookmark is Bookmark => {
    return (
      typeof bookmark === 'object' &&
      bookmark !== null &&
      typeof bookmark.id === 'string' &&
      typeof bookmark.name === 'string' &&
      typeof bookmark.url === 'string'
    );
  };

  // Add a new bookmark
  const addBookmark = (bookmark: Omit<Bookmark, 'id'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
    };
    setBookmarks(prev => [...prev, newBookmark]);
  };

  // Update an existing bookmark
  const updateBookmark = (id: string, updatedBookmark: Partial<Bookmark>) => {
    setBookmarks(prev =>
      prev.map(bookmark =>
        bookmark.id === id ? { ...bookmark, ...updatedBookmark } : bookmark
      )
    );
  };

  // Delete a bookmark
  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    updateBookmark,
    deleteBookmark,
  };
};
