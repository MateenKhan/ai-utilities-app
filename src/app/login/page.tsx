'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Container,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    useTheme as useMuiTheme
} from '@mui/material';
import {
    EmailOutlined,
    LockOutlined,
    Visibility,
    VisibilityOff,
    LoginRounded
} from '@mui/icons-material';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const muiTheme = useMuiTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const success = await login({ email, password });
            if (success) {
                router.push('/');
            } else {
                setError('Invalid email or password. Please check your credentials.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: muiTheme.palette.mode === 'dark'
                    ? 'radial-gradient(circle at top right, #1a1a1a, #000000)'
                    : 'radial-gradient(circle at top right, #f0f7ff, #ffffff)',
                p: 2
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        borderRadius: 4,
                        bgcolor: muiTheme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: muiTheme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'center' }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                p: 1.5,
                                borderRadius: 3,
                                bgcolor: 'primary.main',
                                color: 'white',
                                mb: 3,
                                boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)'
                            }}
                        >
                            <LoginRounded fontSize="large" />
                        </Box>

                        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.5px' }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Sign in to access your utilities and synced data.
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Email Address"
                            variant="outlined"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlined color="action" />
                                        </InputAdornment>
                                    ),
                                }
                            }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                            sx={{ mb: 4 }}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isSubmitting}
                            sx={{
                                py: 1.8,
                                borderRadius: 2,
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(0, 118, 255, 0.23)',
                                }
                            }}
                        >
                            {isSubmitting ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Demo Account
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                Email: test@test.com
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                Password: test
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
