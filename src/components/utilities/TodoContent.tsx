"use client";

import { useState, useRef, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Collapse,
  Tooltip
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { useTodos, type Todo, type TodoStatus } from "@/hooks/useTodos";

export default function TodoContent() {
  const { todos, states, loading, addTodo, updateTodo, deleteTodo, changeTodoStatus, addDocument, removeDocument, addState, deleteState } = useTodos();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [documents, setDocuments] = useState<FileList | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [minimizedImages, setMinimizedImages] = useState<Record<string, boolean>>({});
  const [attachmentTargetId, setAttachmentTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [filterState, setFilterState] = useState<string>("todo"); // Default show 'todo'
  const [showSettings, setShowSettings] = useState(false);
  const [newStateLabel, setNewStateLabel] = useState("");

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

    addTodo({ title, note, status: 'todo', documents: newDocs });
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

  const handleAddState = () => {
    if (newStateLabel.trim()) {
      addState(newStateLabel.trim());
      setNewStateLabel("");
    }
  }

  const filteredTodos = useMemo(() => {
    return todos
      .filter(t => filterState === 'all' ? true : t.status === filterState)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [todos, filterState]);

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
        <Typography>Loading todos...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} mb={4} justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Todo List
          </Typography>
          <Typography color="text.secondary">
            Manage your tasks effectively with custom statuses.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Manage States">
            <IconButton onClick={() => setShowSettings(!showSettings)} color="primary">
              <SettingsRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add New Todo">
            <IconButton onClick={openAddTodoModal} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Collapse in={showSettings}>
        <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>Manage Custom States</Typography>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField
              size="small"
              placeholder="New State Name"
              value={newStateLabel}
              onChange={(e) => setNewStateLabel(e.target.value)}
            />
            <Button variant="contained" onClick={handleAddState} disabled={!newStateLabel.trim()}>Add State</Button>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {states.filter(s => s.isCustom).map(s => (
              <Chip
                key={s.value}
                label={s.label}
                onDelete={() => deleteState(s.value)}
                color="primary"
                variant="outlined"
              />
            ))}
            {states.filter(s => !s.isCustom).map(s => (
              <Chip
                key={s.value}
                label={s.label}
                color="default"
                variant="outlined"
                sx={{ opacity: 0.7 }}
              />
            ))}
          </Stack>
        </Paper>
      </Collapse>

      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        <FilterListRoundedIcon color="action" />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterState}
            label="Filter by Status"
            onChange={(e) => setFilterState(e.target.value)}
          >
            <MenuItem value="all"><em>All Tasks</em></MenuItem>
            {states.map(s => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {filteredTodos.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No tasks found in "{states.find(s => s.value === filterState)?.label || filterState}"
          </Typography>
          <Tooltip title="Create New Todo">
            <IconButton
              onClick={openAddTodoModal}
              sx={{ mt: 2, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filteredTodos.map((todo) => (
            <Card key={todo.id} variant="outlined">
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                  <Box flexGrow={1}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box flexGrow={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="h6" sx={{ textDecoration: todo.status === 'done' ? "line-through" : "none", color: todo.status === 'done' ? 'text.disabled' : 'text.primary' }}>
                              {todo.title}
                            </Typography>
                            {todo.note && (
                              <Typography color="text.secondary" mb={1}>
                                {todo.note}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                              <Chip
                                label={states.find(s => s.value === todo.status)?.label || todo.status}
                                size="small"
                                color={todo.status === 'done' ? 'success' : todo.status === 'progress' ? 'info' : 'default'}
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.secondary">
                                Created {formatDate(todo.createdAt)}
                              </Typography>
                            </Stack>
                          </Box>

                          <Stack direction="column" spacing={1} alignItems="flex-end">
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                              <Select
                                value={todo.status}
                                displayEmpty
                                onChange={(e) => changeTodoStatus(todo.id, e.target.value)}
                                variant="standard"
                                disableUnderline
                                sx={{ fontSize: '0.875rem' }}
                              >
                                {states.map(s => (
                                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Stack direction="row" spacing={1}>
                              {todo.status !== 'done' && (
                                <Tooltip title="Mark as Done">
                                  <IconButton color="success" onClick={() => changeTodoStatus(todo.id, 'done')} size="small">
                                    <CheckCircleOutlineRoundedIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleEditTodo(todo)} size="small">
                                  <EditRoundedIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton color="error" onClick={() => deleteTodo(todo.id)} size="small">
                                  <DeleteOutlineRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                    {/* Thumbnails */}
                    {todo.documents.some(doc => doc.type.startsWith('image/')) && (
                      <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
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

                <Divider sx={{ my: 2 }} />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                  <Typography variant="subtitle2">Attachments</Typography>
                  <Tooltip title="Add Files">
                    <IconButton
                      onClick={() => openAttachmentPicker(todo.id)}
                      color="primary"
                      size="small"
                    >
                      <AttachFileRoundedIcon />
                    </IconButton>
                  </Tooltip>
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
                <Tooltip title="Choose Files">
                  <IconButton
                    onClick={() => {
                      setAttachmentTargetId("new");
                      fileInputRef.current?.click();
                    }}
                    color="primary"
                  >
                    <AttachFileRoundedIcon />
                  </IconButton>
                </Tooltip>
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
