"use client";

import { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    Box,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Alert
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Todo } from "@/hooks/useTodos";

interface ImportOrderDialogProps {
    open: boolean;
    onClose: () => void;
    onImport: (todos: Partial<Todo>[]) => void;
}

export default function ImportOrderDialog({ open, onClose, onImport }: ImportOrderDialogProps) {
    const [previewTodos, setPreviewTodos] = useState<Partial<Todo>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        setPreviewTodos([]);

        try {
            const res = await fetch('/api/amazon/orders');
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.orders || data.orders.length === 0) {
                setError("No new orders found.");
                return;
            }

            const todos: Partial<Todo>[] = data.orders.map((order: any) => {
                const title = order.Title || `Amazon Order ${order.AmazonOrderId}`;
                return {
                    title: title,
                    note: `Order ID: ${order.AmazonOrderId}\nBuyer: ${order.BuyerInfo?.BuyerName || 'Unknown'}\nDate: ${new Date(order.PurchaseDate).toLocaleDateString()}`,
                    amazonLink: `https://sellercentral.amazon.in/orders-v3/order/${order.AmazonOrderId}`,
                    status: 'todo'
                };
            });

            setPreviewTodos(todos);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to sync with Amazon.");
        } finally {
            setLoading(false);
        }
    };

    const handleImport = () => {
        onImport(previewTodos);
        handleClose();
    };

    const handleClose = () => {
        setPreviewTodos([]);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>Import Amazon Orders</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    {previewTodos.length === 0 && !loading && (
                        <Box
                            sx={{
                                p: 4,
                                textAlign: "center",
                            }}
                        >
                            <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Sync from Seller Central
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Fetch recent unshipped orders directly from your Amazon account.
                            </Typography>
                            <Button variant="contained" onClick={fetchOrders}>
                                Fetch Orders
                            </Button>
                        </Box>
                    )}

                    {loading && (
                        <Box textAlign="center" py={4}>
                            <LinearProgress sx={{ mb: 2 }} />
                            <Typography>Fetching orders from Amazon...</Typography>
                        </Box>
                    )}

                    {error && <Alert severity="error">{error}</Alert>}

                    {previewTodos.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Found {previewTodos.length} new orders
                            </Typography>
                            <List dense sx={{ maxHeight: 300, overflow: "auto", bgcolor: "background.paper", border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                {previewTodos.slice(0, 50).map((todo, index) => (
                                    <ListItem key={index} divider>
                                        <ListItemText
                                            primary={todo.title}
                                            secondary={todo.note?.split('\n')[0]}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleImport}
                    disabled={previewTodos.length === 0 || loading}
                >
                    Import {previewTodos.length > 0 ? `${previewTodos.length} Orders` : ""}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
