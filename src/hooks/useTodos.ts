import { useState, useEffect } from 'react';

export type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
};

export type TodoStatus = 'todo' | 'progress' | 'done' | string;

// ... (previous type definitions)

export type Todo = {
  id: string;
  title: string;
  note: string;
  status: TodoStatus;
  documents: Document[];
  createdAt: string; // Store as ISO string for serialization
  amazonLink?: string;
};

export type TodoState = {
  value: string;
  label: string;
  isCustom?: boolean;
}

const DEFAULT_STATES: TodoState[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

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
  // Handle migration from 'completed' boolean to 'status' string if necessary
  // But for new logic we expect 'status'
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.note === 'string' &&
    (typeof candidate.status === 'string' || typeof (candidate as any).completed === 'boolean') &&
    typeof candidate.createdAt === 'string' &&
    Array.isArray(candidate.documents) &&
    candidate.documents.every(isValidDocument) &&
    (candidate.amazonLink === undefined || typeof candidate.amazonLink === 'string')
  );
};

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [states, setStates] = useState<TodoState[]>(DEFAULT_STATES);
  const [loading, setLoading] = useState(true);

  // Load todos and states from localStorage
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const loadData = () => {
      try {
        const savedTodos = localStorage.getItem('todos');
        const savedStates = localStorage.getItem('todoStates');

        if (savedStates) {
          setStates(JSON.parse(savedStates));
        } else {
          setStates(DEFAULT_STATES);
        }

        if (savedTodos) {
          const parsedTodos = JSON.parse(savedTodos);
          if (Array.isArray(parsedTodos) && parsedTodos.every(isValidTodo)) {
            // Migrate old completed boolean to status if needed
            const migratedTodos = parsedTodos.map((t: any) => {
              if (t.status) return t;
              return {
                ...t,
                status: t.completed ? 'done' : 'todo',
                completed: undefined // Cleanup old field
              };
            });
            setTodos(migratedTodos);
          } else {
            localStorage.removeItem('todos');
            setTodos([]);
          }
        }
      } catch (error) {
        console.error('Failed to load todos:', error);
        localStorage.removeItem('todos');
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'todos' && e.newValue !== null) {
        try {
          const parsedTodos = JSON.parse(e.newValue);
          if (Array.isArray(parsedTodos) && parsedTodos.every(isValidTodo)) {
            // Same migration logic here
            const migratedTodos = parsedTodos.map((t: any) => {
              if (t.status) return t;
              return {
                ...t,
                status: t.completed ? 'done' : 'todo',
                completed: undefined
              };
            });
            setTodos(migratedTodos);
          }
        } catch (error) {
          console.error('Failed to parse todos from storage event:', error);
        }
      }
      if (e.key === 'todoStates' && e.newValue !== null) {
        try {
          setStates(JSON.parse(e.newValue));
        } catch (e) {
          console.error('Failed to parse todo states', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save todos and states to localStorage
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      try {
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('todoStates', JSON.stringify(states));
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    }
  }, [todos, loading, states]);

  // Add a new todo
  const addTodo = (todo: Omit<Todo, 'id' | 'createdAt' | 'documents' | 'status'> & { documents?: Document[], status?: string, amazonLink?: string }) => {
    const newTodo: Todo = {
      ...todo,
      status: todo.status || 'todo',
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      documents: todo.documents || [],
      amazonLink: todo.amazonLink,
    };
    setTodos(prev => [...prev, newTodo]);
  };

  // Bulk add todos
  const addTodos = (newTodos: (Omit<Todo, 'id' | 'createdAt' | 'documents' | 'status'> & { documents?: Document[], status?: string, amazonLink?: string })[]) => {
    const timestamp = Date.now();
    const createdTodos: Todo[] = newTodos.map((todo, index) => ({
      ...todo,
      status: todo.status || 'todo',
      id: `${timestamp}-${index}`,
      createdAt: new Date().toISOString(),
      documents: todo.documents || [],
      amazonLink: todo.amazonLink,
    }));

    setTodos(prev => [...prev, ...createdTodos]);
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

  // Updated toggle/change status
  const changeTodoStatus = (id: string, status: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const addState = (label: string) => {
    const value = label.toLowerCase().replace(/\s+/g, '-');
    if (states.find(s => s.value === value)) return;
    setStates(prev => [...prev, { label, value, isCustom: true }]);
  }

  const deleteState = (value: string) => {
    setStates(prev => prev.filter(s => s.value !== value));
    // Optionally move todos with this state to 'todo' or handle them
    setTodos(prev => prev.map(t => t.status === value ? { ...t, status: 'todo' } : t));
  }


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
    states,
    loading,
    addTodo,
    addTodos,
    updateTodo,
    deleteTodo,
    changeTodoStatus,
    addState,
    deleteState,
    addDocument,
    removeDocument,
  };
};
