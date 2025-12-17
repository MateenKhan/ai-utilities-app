import { useState, useEffect } from 'react';

export type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
};

export type Todo = {
  id: string;
  title: string;
  note: string;
  completed: boolean;
  documents: Document[];
  createdAt: string; // Store as ISO string for serialization
};

const isValidDocument = (doc: unknown): doc is Document => {
  return (
    typeof doc === 'object' &&
    doc !== null &&
    typeof (doc as Document).id === 'string' &&
    typeof (doc as Document).name === 'string' &&
    typeof (doc as Document).type === 'string' &&
    typeof (doc as Document).url === 'string'
  );
};

const isValidTodo = (todo: unknown): todo is Todo => {
  if (typeof todo !== 'object' || todo === null) {
    return false;
  }

  const candidate = todo as Todo;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.note === 'string' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'string' &&
    Array.isArray(candidate.documents) &&
    candidate.documents.every(isValidDocument)
  );
};

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // Load todos from localStorage
  useEffect(() => {
    const loadTodos = () => {
      try {
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          const parsedTodos = JSON.parse(savedTodos);
          // Validate that we have an array of todos
          if (Array.isArray(parsedTodos) && parsedTodos.every(isValidTodo)) {
            setTodos(parsedTodos);
          } else {
            // If data is corrupted, clear it
            localStorage.removeItem('todos');
            setTodos([]);
          }
        }
      } catch (error) {
        console.error('Failed to load todos:', error);
        // If there's an error, clear the corrupted data
        localStorage.removeItem('todos');
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'todos' && e.newValue !== null) {
        try {
          const parsedTodos = JSON.parse(e.newValue);
          if (Array.isArray(parsedTodos) && parsedTodos.every(isValidTodo)) {
            setTodos(parsedTodos);
          }
        } catch (error) {
          console.error('Failed to parse todos from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('todos', JSON.stringify(todos));
      } catch (error) {
        console.error('Failed to save todos:', error);
      }
    }
  }, [todos, loading]);

  // Add a new todo
  const addTodo = (todo: Omit<Todo, 'id' | 'createdAt' | 'documents'>) => {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      documents: [],
    };
    setTodos(prev => [...prev, newTodo]);
  };

  // Update an existing todo
  const updateTodo = (id: string, updatedTodo: Partial<Todo>) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, ...updatedTodo } : todo
      )
    );
  };

  // Delete a todo
  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Toggle todo completion status
  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Add document to todo
  const addDocument = (todoId: string, document: Omit<Document, 'id'>) => {
    const newDocument: Document = {
      ...document,
      id: `${Date.now()}`,
    };
    
    setTodos(prev =>
      prev.map(todo =>
        todo.id === todoId
          ? { ...todo, documents: [...todo.documents, newDocument] }
          : todo
      )
    );
  };

  // Remove document from todo
  const removeDocument = (todoId: string, docId: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === todoId
          ? { ...todo, documents: todo.documents.filter(doc => doc.id !== docId) }
          : todo
      )
    );
  };

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    addDocument,
    removeDocument,
  };
};
