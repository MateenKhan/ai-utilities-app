"use client";

import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Typography,
    Alert,
    Link as MuiLink,
} from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login({ email, password });
        } catch (err: any) {
            setError(err.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                    <Box textAlign="center" mb={3}>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Login
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Welcome back to Airtajal Utilities
                        </Typography>
                    </Box>

                    {registered && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Account created successfully! Please login.
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                        <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{" "}
                                <MuiLink component={Link} href="/signup" underline="hover">
                                    Sign up
                                </MuiLink>
                            </Typography>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
}
