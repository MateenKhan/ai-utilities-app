import { useState, useEffect } from 'react';

export type Bookmark = {
  id: number;
  name: string;
  url: string;
  folder?: string | null;
  tags?: string[];
  description?: string | null;
  favicon?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bookmarks from API
  const loadBookmarks = async (filters?: {
    folder?: string;
    tag?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.folder) params.append('folder', filters.folder);
      if (filters?.tag) params.append('tag', filters.tag);
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/api/bookmarks${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, fallback to localStorage
          loadBookmarksFromLocalStorage();
          return;
        }
        throw new Error('Failed to load bookmarks');
      }

      const data = await response.json();
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
      // Fallback to localStorage if API fails
      loadBookmarksFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Load bookmarks from localStorage
  const loadBookmarksFromLocalStorage = () => {
    try {
      if (typeof window === 'undefined') return;

      const savedBookmarks = localStorage.getItem('bookmarks');
      if (savedBookmarks) {
        const parsedBookmarks = JSON.parse(savedBookmarks);
        if (Array.isArray(parsedBookmarks)) {
          // Convert old format (string id) to new format (number id)
          const converted = parsedBookmarks.map((b: any, index: number) => ({
            id: typeof b.id === 'string' ? index + 1 : b.id,
            name: b.name,
            url: b.url,
            folder: b.folder || null,
            tags: b.tags || [],
            description: b.description || null,
            favicon: b.favicon || null,
          }));
          setBookmarks(converted);
        }
      }
    } catch (error) {
      console.error('Failed to load bookmarks from localStorage:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadBookmarks();
  }, []);

  // Add a new bookmark
  const addBookmark = async (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);

      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmark),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Fallback to localStorage
          addBookmarkToLocalStorage(bookmark);
          return;
        }
        throw new Error('Failed to add bookmark');
      }

      const data = await response.json();
      setBookmarks(prev => [data.bookmark, ...prev]);
      return data.bookmark;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      setError(err instanceof Error ? err.message : 'Failed to add bookmark');
      // Fallback to localStorage
      addBookmarkToLocalStorage(bookmark);
    }
  };

  // Fallback: Add to localStorage
  const addBookmarkToLocalStorage = (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now(),
    };
    const updated = [newBookmark, ...bookmarks];
    setBookmarks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookmarks', JSON.stringify(updated));
    }
  };

  // Update an existing bookmark
  const updateBookmark = async (id: number, updatedData: Partial<Bookmark>) => {
    try {
      setError(null);

      const response = await fetch('/api/bookmarks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedData }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Fallback to localStorage
          updateBookmarkInLocalStorage(id, updatedData);
          return;
        }
        throw new Error('Failed to update bookmark');
      }

      const data = await response.json();
      setBookmarks(prev =>
        prev.map(bookmark => (bookmark.id === id ? data.bookmark : bookmark))
      );
      return data.bookmark;
    } catch (err) {
      console.error('Error updating bookmark:', err);
      setError(err instanceof Error ? err.message : 'Failed to update bookmark');
      // Fallback to localStorage
      updateBookmarkInLocalStorage(id, updatedData);
    }
  };

  // Fallback: Update in localStorage
  const updateBookmarkInLocalStorage = (id: number, updatedData: Partial<Bookmark>) => {
    const updated = bookmarks.map(bookmark =>
      bookmark.id === id ? { ...bookmark, ...updatedData } : bookmark
    );
    setBookmarks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookmarks', JSON.stringify(updated));
    }
  };

  // Delete a bookmark
  const deleteBookmark = async (id: number) => {
    try {
      setError(null);

      const response = await fetch(`/api/bookmarks?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Fallback to localStorage
          deleteBookmarkFromLocalStorage(id);
          return;
        }
        throw new Error('Failed to delete bookmark');
      }

      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete bookmark');
      // Fallback to localStorage
      deleteBookmarkFromLocalStorage(id);
    }
  };

  // Fallback: Delete from localStorage
  const deleteBookmarkFromLocalStorage = (id: number) => {
    const updated = bookmarks.filter(bookmark => bookmark.id !== id);
    setBookmarks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookmarks', JSON.stringify(updated));
    }
  };

  // Sync localStorage bookmarks to database (for migration)
  const syncLocalStorageToDatabase = async () => {
    try {
      if (typeof window === 'undefined') return;

      const savedBookmarks = localStorage.getItem('bookmarks');
      if (!savedBookmarks) return;

      const localBookmarks = JSON.parse(savedBookmarks);
      if (!Array.isArray(localBookmarks) || localBookmarks.length === 0) return;

      // Upload each bookmark to the database
      for (const bookmark of localBookmarks) {
        await addBookmark({
          name: bookmark.name,
          url: bookmark.url,
          folder: bookmark.folder,
          tags: bookmark.tags,
          description: bookmark.description,
          favicon: bookmark.favicon,
        });
      }

      // Clear localStorage after successful sync
      localStorage.removeItem('bookmarks');
      console.log('Successfully synced bookmarks to database');
    } catch (error) {
      console.error('Failed to sync bookmarks:', error);
    }
  };

  return {
    bookmarks,
    loading,
    error,
    loadBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    syncLocalStorageToDatabase,
  };
};
