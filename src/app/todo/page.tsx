"use client";

import { useState, useRef } from "react";
import { FiPlus, FiPaperclip, FiTrash2, FiEye, FiDownload } from "react-icons/fi";
import { useTodos, type Document, type Todo } from "@/hooks/useTodos";

export default function TodoPage() {
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo, addDocument, removeDocument } = useTodos();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [documents, setDocuments] = useState<FileList | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTodo = () => {
    if (!title.trim()) return;

    addTodo({ title, note, completed: false });
    resetForm();
  };

  const handleUpdateTodo = () => {
    if (!editingId || !title.trim()) return;

    updateTodo(editingId, { title, note });
    setEditingId(null);
    resetForm();
  };

  const handleEditTodo = (todo: Todo) => {
    setTitle(todo.title);
    setNote(todo.note);
    setEditingId(todo.id);
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
  };

  const handleToggleComplete = (id: string) => {
    toggleTodo(id);
  };

  const resetForm = () => {
    setTitle("");
    setNote("");
    setDocuments(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(e.target.files);
    }
  };

  const handleAddDocuments = (todoId: string) => {
    if (!documents) return;

    // In a real app, we would upload the files to a server
    // For this demo, we'll just store metadata
    for (let i = 0; i < documents.length; i++) {
      const file = documents[i];
      addDocument(todoId, {
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    }

    setDocuments(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveDocument = (todoId: string, docId: string) => {
    removeDocument(todoId, docId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Todo List</h1>
        
        {/* Add/Edit Todo Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? "Edit Todo" : "Add New Todo"}
          </h2>
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What needs to be done?"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="note" className="block text-gray-700 font-medium mb-2">
              Notes
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add detailed notes..."
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={editingId ? handleUpdateTodo : handleAddTodo}
              disabled={!title.trim()}
              className={`px-4 py-2 rounded font-medium ${
                title.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <FiPlus className="inline mr-2" />
              {editingId ? "Update Todo" : "Add Todo"}
            </button>
            
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        
        {/* Todo List */}
        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No todos yet</h2>
              <p className="text-gray-500">Add your first todo to get started</p>
            </div>
          ) : (
            todos
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((todo) => (
                <div 
                  key={todo.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                    todo.completed ? "border-green-300" : "border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo.id)}
                          className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="ml-4">
                          <h3 className={`text-lg font-semibold ${todo.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
                            {todo.title}
                          </h3>
                          {todo.note && (
                            <p className="text-gray-600 mt-2">{todo.note}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Created: {formatDate(todo.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTodo(todo)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    
                    {/* Documents Section */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700">Attached Documents</h4>
                        <label className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer text-sm">
                          <FiPaperclip className="mr-1" />
                          Add
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {documents && (
                        <div className="mb-3 p-3 bg-blue-50 rounded flex justify-between items-center">
                          <span className="text-sm text-blue-800">
                            {documents.length} file(s) selected
                          </span>
                          <button
                            onClick={() => handleAddDocuments(todo.id)}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                          >
                            Attach
                          </button>
                        </div>
                      )}
                      
                      {todo.documents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {todo.documents.map((doc) => (
                            <div 
                              key={doc.id} 
                              className="border border-gray-200 rounded p-3 flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <div className="bg-gray-100 p-2 rounded mr-3">
                                  <FiPaperclip />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                                    {doc.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {doc.type.split("/")[1] || doc.type}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FiEye />
                                </a>
                                <button
                                  onClick={() => handleRemoveDocument(todo.id, doc.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No documents attached</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}