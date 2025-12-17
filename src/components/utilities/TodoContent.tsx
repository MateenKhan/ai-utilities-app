"use client";

import { useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Chip,
  Paper,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";

import { useTodos, type Todo } from "@/hooks/useTodos";

export default function TodoContent() {
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo, addDocument, removeDocument } = useTodos();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [documents, setDocuments] = useState<FileList | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [minimizedImages, setMinimizedImages] = useState<Record<string, boolean>>({});
  const [attachmentTargetId, setAttachmentTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const handleAddTodo = () => {
    if (!title.trim()) return;

    const newDocs = [];
    if (documents && attachmentTargetId === "new") {
      for (let i = 0; i < documents.length; i++) {
        const file = documents[i];
        newDocs.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
        });
      }
    }

    addTodo({ title, note, completed: false, documents: newDocs });
    closeModal();
  };

  const handleUpdateTodo = () => {
    if (!editingId || !title.trim()) return;

    updateTodo(editingId, { title, note });
    closeModal();
  };

  const handleEditTodo = (todo: Todo) => {
    setTitle(todo.title);
    setNote(todo.note);
    setEditingId(todo.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setTitle("");
    setNote("");
    setDocuments(null);
    setAttachmentTargetId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(e.target.files);
    }
  };

  const openAttachmentPicker = (todoId: string) => {
    setAttachmentTargetId(todoId);
    fileInputRef.current?.click();
  };

  const handleAddDocuments = () => {
    if (!documents || !attachmentTargetId) return;

    for (let i = 0; i < documents.length; i += 1) {
      const file = documents[i];
      addDocument(attachmentTargetId, {
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    }

    setDocuments(null);
    setAttachmentTargetId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleImageMinimize = (docId: string) => {
    setMinimizedImages((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const openAddTodoModal = () => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <Typography>Loading todos...</Typography>
      </Box>
    );
  }

  return (
    <Box>


      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} mb={4}>
        <Box flexGrow={1}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Todo List
          </Typography>
          <Typography color="text.secondary">
            Keep track of work, attach supporting documents, and never miss a deadline.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAddTodoModal}>
          Add New Todo
        </Button>
      </Stack>

      {todos.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No todos yet
          </Typography>
          <Typography color="text.secondary" mb={2}>
            Capture your first task to kickstart productivity.
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAddTodoModal}>
            Create Todo
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {todos
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((todo) => (
              <Card key={todo.id} variant="outlined">
                <CardContent>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="flex-start" flexGrow={1}>
                      <Checkbox
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <Box flexGrow={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="h6" sx={{ textDecoration: todo.completed ? "line-through" : "none" }}>
                              {todo.title}
                            </Typography>
                            {todo.note && (
                              <Typography color="text.secondary" mb={1}>
                                {todo.note}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                              Created {formatDate(todo.createdAt)}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleEditTodo(todo)} size="small">
                              <EditRoundedIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => deleteTodo(todo.id)} size="small">
                              <DeleteOutlineRoundedIcon />
                            </IconButton>
                          </Stack>
                        </Stack>

                        {/* Thumbnails */}
                        {todo.documents.some(doc => doc.type.startsWith('image/')) && (
                          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                            {todo.documents.filter(doc => doc.type.startsWith('image/')).map(doc => (
                              <Box
                                key={doc.id}
                                component="img"
                                src={doc.url}
                                alt={doc.name}
                                sx={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 1,
                                  objectFit: "cover",
                                  border: "1px solid",
                                  borderColor: "divider"
                                }}
                              />
                            ))}
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                    <Typography variant="subtitle2">Attachments</Typography>
                    <Button
                      startIcon={<AttachFileRoundedIcon />}
                      onClick={() => openAttachmentPicker(todo.id)}
                      variant="outlined"
                      size="small"
                    >
                      Add Files
                    </Button>
                    {documents && attachmentTargetId === todo.id && (
                      <Chip
                        label={`${documents.length} file(s) ready`}
                        color="primary"
                        onDelete={() => {
                          setDocuments(null);
                          setAttachmentTargetId(null);
                        }}
                      />
                    )}
                    {documents && attachmentTargetId === todo.id && (
                      <Button size="small" variant="contained" onClick={handleAddDocuments}>
                        Attach
                      </Button>
                    )}
                  </Stack>

                  {todo.documents.length > 0 ? (
                    <Stack spacing={1} mt={2}>
                      {todo.documents.map((doc) => (
                        <Paper key={doc.id} variant="outlined" sx={{ p: 2 }}>
                          {doc.type.startsWith("image/") && (
                            <Box mb={1}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {doc.name}
                                </Typography>
                                <IconButton size="small" onClick={() => toggleImageMinimize(doc.id)}>
                                  {minimizedImages[doc.id] ? <FullscreenRoundedIcon fontSize="small" /> : <FullscreenExitRoundedIcon fontSize="small" />}
                                </IconButton>
                              </Stack>
                              {!minimizedImages[doc.id] && (
                                <Box component="img" src={doc.url} alt={doc.name} sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 1, border: "1px solid", borderColor: "divider" }} />
                              )}
                            </Box>
                          )}
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <AttachFileRoundedIcon fontSize="small" />
                              <Box>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {doc.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {doc.type || "Untyped"}
                                </Typography>
                              </Box>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              <IconButton component="a" href={doc.url} target="_blank" rel="noopener noreferrer">
                                <VisibilityRoundedIcon fontSize="small" />
                              </IconButton>
                              <IconButton color="error" onClick={() => removeDocument(todo.id, doc.id)}>
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Typography mt={2} color="text.secondary" variant="body2">
                      No documents attached.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
        </Stack>
      )}

      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        hidden
      />

      <Dialog open={showModal} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Todo" : "Add New Todo"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
            {!editingId && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AttachFileRoundedIcon />}
                  onClick={() => {
                    setAttachmentTargetId("new");
                    fileInputRef.current?.click();
                  }}
                >
                  Choose Files
                </Button>
                {documents && attachmentTargetId === "new" && (
                  <Chip
                    sx={{ ml: 2 }}
                    label={`${documents.length} file(s) selected`}
                    onDelete={() => {
                      setDocuments(null);
                      setAttachmentTargetId(null);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!title.trim()}
            onClick={editingId ? handleUpdateTodo : handleAddTodo}
          >
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
