'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Tooltip,
    Typography,
    Chip,
    Zoom,
    Fade,
    Slide,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { useNotification } from '@/contexts/NotificationContext';

interface Finance {
    id: string;
    sno: number;
    name: string;
    amount: number;
    description: string | null;
    category: string;
    createdAt: string;
    updatedAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

type SortOrder = 'asc' | 'desc';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

export default function FinancesContent() {
    const { showNotification } = useNotification();
    const [finances, setFinances] = useState<Finance[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        amount: '',
        description: '',
        category: '',
    });
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        amount: '',
        description: '',
        category: '',
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        fetchFinances();
    }, [pagination.page, pagination.limit, sortBy, sortOrder, search, categoryFilter]);

    const fetchFinances = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sortBy,
                sortOrder,
                ...(search && { search }),
                ...(categoryFilter && { category: categoryFilter }),
            });

            const res = await fetch(`/api/finances?${params}`);
            if (res.ok) {
                const data = await res.json();
                setFinances(data.finances);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch finances:', error);
            showNotification('Failed to fetch finances', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.size === finances.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(finances.map((f) => f.id)));
        }
    };

    const handleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleCreate = async () => {
        if (!createForm.name || !createForm.amount || !createForm.category) {
            showNotification('Name, Kitne (Amount), and Category are required!', 'error');
            return;
        }

        try {
            const res = await fetch('/api/finances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm),
            });

            if (res.ok) {
                setShowCreateDialog(false);
                setCreateForm({ name: '', amount: '', description: '', category: '' });
                fetchFinances();
                showNotification('Finance entry created successfully!', 'success');
            } else {
                showNotification('Failed to create finance entry', 'error');
            }
        } catch (error) {
            console.error('Create error:', error);
            showNotification('Failed to create finance entry', 'error');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            const res = await fetch(`/api/finances/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                setEditingId(null);
                fetchFinances();
                showNotification('Finance entry updated successfully!', 'success');
            } else {
                showNotification('Failed to update finance entry', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showNotification('Failed to update finance entry', 'error');
        }
    };

    const startEdit = (finance: Finance) => {
        setEditingId(finance.id);
        setEditForm({
            name: finance.name,
            amount: finance.amount.toString(),
            description: finance.description || '',
            category: finance.category,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', amount: '', description: '', category: '' });
    };

    const confirmDelete = (ids: string[]) => {
        setDeleteIds(ids);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        try {
            const res = await fetch('/api/finances', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: deleteIds }),
            });

            if (res.ok) {
                setShowDeleteConfirm(false);
                setDeleteIds([]);
                setSelectedIds(new Set());
                fetchFinances();
                showNotification(
                    `${deleteIds.length} finance ${deleteIds.length === 1 ? 'entry' : 'entries'} deleted successfully!`,
                    'success'
                );
            } else {
                showNotification('Failed to delete finance entries', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showNotification('Failed to delete finance entries', 'error');
        }
    };

    if (loading && finances.length === 0) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
            {/* Header */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} mb={4}>
                <Box flexGrow={1}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <AccountBalanceWalletRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                        <Typography variant="h4" fontWeight={700}>
                            Finances
                        </Typography>
                    </Stack>
                    <Typography color="text.secondary">
                        Track your income and expenses with ease
                    </Typography>
                </Box>
                {selectedIds.size > 0 && (
                    <Zoom in={selectedIds.size > 0}>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteRoundedIcon />}
                            onClick={() => confirmDelete(Array.from(selectedIds))}
                            sx={{ boxShadow: 3 }}
                        >
                            Delete ({selectedIds.size})
                        </Button>
                    </Zoom>
                )}
            </Stack>

            {/* Filters */}
            <Card sx={{ mb: 3, boxShadow: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} p={2}>
                    <TextField
                        placeholder="Search by name or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                    />
                    <TextField
                        select
                        label="Category"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        size="small"
                        sx={{ minWidth: 200 }}
                        SelectProps={{ native: true }}
                        InputProps={{
                            startAdornment: <FilterListRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </TextField>
                </Stack>
            </Card>

            {/* Table */}
            <Paper sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'primary.main' }}>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedIds.size === finances.length && finances.length > 0}
                                        onChange={handleSelectAll}
                                        sx={{ color: 'white' }}
                                    />
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                                    <TableSortLabel
                                        active={sortBy === 'sno'}
                                        direction={sortBy === 'sno' ? sortOrder : 'asc'}
                                        onClick={() => handleSort('sno')}
                                        sx={{
                                            color: 'white !important',
                                            '& .MuiTableSortLabel-icon': { color: 'white !important' },
                                        }}
                                    >
                                        S.No
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                                    <TableSortLabel
                                        active={sortBy === 'name'}
                                        direction={sortBy === 'name' ? sortOrder : 'asc'}
                                        onClick={() => handleSort('name')}
                                        sx={{
                                            color: 'white !important',
                                            '& .MuiTableSortLabel-icon': { color: 'white !important' },
                                        }}
                                    >
                                        Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                                    <TableSortLabel
                                        active={sortBy === 'amount'}
                                        direction={sortBy === 'amount' ? sortOrder : 'asc'}
                                        onClick={() => handleSort('amount')}
                                        sx={{
                                            color: 'white !important',
                                            '& .MuiTableSortLabel-icon': { color: 'white !important' },
                                        }}
                                    >
                                        Kitne
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Kyu</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                                    <TableSortLabel
                                        active={sortBy === 'category'}
                                        direction={sortBy === 'category' ? sortOrder : 'asc'}
                                        onClick={() => handleSort('category')}
                                        sx={{
                                            color: 'white !important',
                                            '& .MuiTableSortLabel-icon': { color: 'white !important' },
                                        }}
                                    >
                                        Category
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                                    <TableSortLabel
                                        active={sortBy === 'createdAt'}
                                        direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                                        onClick={() => handleSort('createdAt')}
                                        sx={{
                                            color: 'white !important',
                                            '& .MuiTableSortLabel-icon': { color: 'white !important' },
                                        }}
                                    >
                                        Timestamp
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {finances.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <AccountBalanceWalletRoundedIcon
                                            sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
                                        />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No finance entries yet
                                        </Typography>
                                        <Typography color="text.secondary" paragraph>
                                            Create your first entry to start tracking your finances
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                finances.map((finance, index) => (
                                    <Fade in key={finance.id} timeout={300 + index * 50}>
                                        <TableRow
                                            hover
                                            sx={{
                                                '&:hover': { bgcolor: 'action.hover' },
                                                transition: 'background-color 0.2s',
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedIds.has(finance.id)}
                                                    onChange={() => handleSelectOne(finance.id)}
                                                />
                                            </TableCell>
                                            <TableCell>{(pagination.page - 1) * pagination.limit + index + 1}</TableCell>
                                            <TableCell>
                                                {editingId === finance.id ? (
                                                    <TextField
                                                        value={editForm.name}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, name: e.target.value })
                                                        }
                                                        size="small"
                                                        fullWidth
                                                    />
                                                ) : (
                                                    <Typography fontWeight={500}>{finance.name}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === finance.id ? (
                                                    <TextField
                                                        type="number"
                                                        value={editForm.amount}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, amount: e.target.value })
                                                        }
                                                        size="small"
                                                        fullWidth
                                                    />
                                                ) : (
                                                    <Typography
                                                        fontWeight={600}
                                                        color={finance.amount >= 0 ? 'success.main' : 'error.main'}
                                                    >
                                                        ₹{finance.amount.toLocaleString('en-IN', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === finance.id ? (
                                                    <TextField
                                                        value={editForm.description}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, description: e.target.value })
                                                        }
                                                        size="small"
                                                        fullWidth
                                                        multiline
                                                    />
                                                ) : (
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            maxWidth: 200,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {finance.description || '-'}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === finance.id ? (
                                                    <TextField
                                                        select
                                                        value={editForm.category}
                                                        onChange={(e) =>
                                                            setEditForm({ ...editForm, category: e.target.value })
                                                        }
                                                        size="small"
                                                        fullWidth
                                                        SelectProps={{ native: true }}
                                                    >
                                                        {categories.map((cat) => (
                                                            <option key={cat} value={cat}>
                                                                {cat}
                                                            </option>
                                                        ))}
                                                    </TextField>
                                                ) : (
                                                    <Chip label={finance.category} size="small" color="primary" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(finance.createdAt).toLocaleDateString('en-IN')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(finance.createdAt).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {editingId === finance.id ? (
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <Tooltip title="Save">
                                                            <IconButton
                                                                onClick={() => handleUpdate(finance.id)}
                                                                color="success"
                                                                size="small"
                                                            >
                                                                <CheckRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Cancel">
                                                            <IconButton onClick={cancelEdit} size="small">
                                                                <CloseRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                ) : (
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                onClick={() => startEdit(finance)}
                                                                color="primary"
                                                                size="small"
                                                            >
                                                                <EditRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                onClick={() => confirmDelete([finance.id])}
                                                                color="error"
                                                                size="small"
                                                            >
                                                                <DeleteRoundedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </Fade>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {pagination.totalPages > 0 && (
                    <TablePagination
                        component="div"
                        count={pagination.total}
                        page={pagination.page - 1}
                        onPageChange={(e, page) => setPagination({ ...pagination, page: page + 1 })}
                        rowsPerPage={pagination.limit}
                        onRowsPerPageChange={(e) =>
                            setPagination({ ...pagination, limit: parseInt(e.target.value), page: 1 })
                        }
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                )}
            </Paper>

            {/* FAB */}
            <Zoom in>
                <Fab
                    color="primary"
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        boxShadow: 6,
                    }}
                    onClick={() => setShowCreateDialog(true)}
                >
                    <AddRoundedIcon />
                </Fab>
            </Zoom>

            {/* Create Dialog */}
            <Dialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Slide}
                TransitionProps={{ direction: 'up' } as any}
            >
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AccountBalanceWalletRoundedIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Create Finance Entry
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Name"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Kitne (Amount)"
                            type="number"
                            value={createForm.amount}
                            onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                            fullWidth
                            required
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                            }}
                        />
                        <TextField
                            label="Kyu (Description)"
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <TextField
                            select
                            label="Category"
                            value={createForm.category}
                            onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                            fullWidth
                            required
                            SelectProps={{ native: true }}
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => {
                            setShowCreateDialog(false);
                            setCreateForm({ name: '', amount: '', description: '', category: '' });
                        }}
                    >
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleCreate} startIcon={<AddRoundedIcon />}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <DeleteRoundedIcon color="error" />
                        <Typography variant="h6" fontWeight={600}>
                            Confirm Delete
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete{' '}
                        <strong>{deleteIds.length}</strong>{' '}
                        {deleteIds.length === 1 ? 'entry' : 'entries'}?
                    </Typography>
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteIds([]);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        startIcon={<DeleteRoundedIcon />}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
