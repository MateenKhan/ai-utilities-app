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
    Alert,
    TextField,
    Link
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { FaAmazon } from "react-icons/fa";
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
    const [needsAuth, setNeedsAuth] = useState(false);
    const [needsConfig, setNeedsConfig] = useState(false);
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        setNeedsAuth(false);
        setNeedsConfig(false);
        setPreviewTodos([]);

        try {
            const res = await fetch('/api/amazon/orders');
            const data = await res.json();

            if (res.status === 401) {
                if (data.needsConfig) {
                    setNeedsConfig(true);
                    return;
                }
                if (data.needsAuth) {
                    setNeedsAuth(true);
                    return;
                }
            }

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.orders || data.orders.length === 0) {
                setError("No new orders found in the last 7 days.");
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

    const handleConnect = () => {
        window.location.href = '/api/amazon/login';
    };

    const handleSaveConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/amazon/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId, clientSecret })
            });
            if (!res.ok) throw new Error("Failed to save config");

            // After saving, redirect to login
            window.location.href = '/api/amazon/login';
        } catch (e: any) {
            setError(e.message);
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
        setNeedsAuth(false);
        setNeedsConfig(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>Import Amazon Orders</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    {previewTodos.length === 0 && !loading && !needsAuth && !needsConfig && (
                        <Box
                            sx={{
                                p: 4,
                                textAlign: "center",
                            }}
                        >
                            <FaAmazon size={48} color="#FF9900" style={{ marginBottom: 16 }} />
                            <Typography variant="h6" gutterBottom>
                                Sync from Seller Central
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Fetch recent unshipped orders directly from your Amazon account.
                            </Typography>
                            <Button variant="contained" onClick={fetchOrders} sx={{ bgcolor: '#FF9900', '&:hover': { bgcolor: '#e68a00' } }}>
                                Fetch Orders
                            </Button>
                            <Box mt={2}>
                                <Button variant="text" onClick={() => window.location.href = '/api/amazon/login'} sx={{ color: '#FF9900' }}>
                                    Connect with Amazon
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {needsConfig && (
                        <Box py={2}>
                            <Typography variant="h6" gutterBottom>Configure Amazon App</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Please enter your Amazon SP-API Application details. You can find these in Seller Central App settings.
                            </Typography>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Need credentials? <Link href="https://sellercentral.amazon.com/selling-partner/developer/console" target="_blank" rel="noopener">Go to Seller Central Developer Console</Link> to create an LWA app.
                            </Alert>
                            <Stack spacing={2}>
                                <TextField
                                    label="LWA Client ID"
                                    fullWidth
                                    value={clientId}
                                    onChange={e => setClientId(e.target.value)}
                                />
                                <TextField
                                    label="LWA Client Secret"
                                    fullWidth
                                    type="password"
                                    value={clientSecret}
                                    onChange={e => setClientSecret(e.target.value)}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSaveConfig}
                                    disabled={!clientId || !clientSecret}
                                    sx={{ bgcolor: '#FF9900', '&:hover': { bgcolor: '#e68a00' }, mt: 2 }}
                                >
                                    Save & Connect
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    {needsAuth && (
                        <Box textAlign="center" py={4}>
                            <FaAmazon size={48} color="#FF9900" style={{ marginBottom: 16 }} />
                            <Typography variant="h6" gutterBottom>
                                Connect to Amazon
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                You need to log in with your Amazon Seller account to fetch orders.
                            </Typography>
                            <Button variant="contained" onClick={handleConnect} sx={{ bgcolor: '#FF9900', '&:hover': { bgcolor: '#e68a00' } }}>
                                Log in with Amazon
                            </Button>
                        </Box>
                    )}

                    {loading && (
                        <Box textAlign="center" py={4}>
                            <LinearProgress sx={{ mb: 2 }} />
                            <Typography>Connecting to Amazon...</Typography>
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
        </Dialog >
    );
}
