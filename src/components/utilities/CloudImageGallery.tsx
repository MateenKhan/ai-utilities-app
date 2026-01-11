import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    IconButton,
    Tooltip,
    Stack,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';

interface CloudImage {
    id: string;
    name: string;
    description: string;
    category: string;
    url: string;
    createdAt: string;
}

interface CloudImageGalleryProps {
    onSelect?: (url: string) => void;
}

const CloudImageGallery: React.FC<CloudImageGalleryProps> = ({ onSelect }) => {
    const [images, setImages] = useState<CloudImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    // Upload form state
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadName, setUploadName] = useState('');
    const [uploadDesc, setUploadDesc] = useState('');
    const [uploadCategory, setUploadCategory] = useState('');

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/cloud-images?search=${encodeURIComponent(search)}`);
            if (res.ok) {
                const data = await res.json();
                setImages(data.images);
            }
        } catch (error) {
            console.error('Failed to fetch images', error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchImages();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchImages]);

    const handleUpload = async () => {
        if (!uploadFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', uploadFile);
            formData.append('name', uploadName);
            formData.append('description', uploadDesc);
            formData.append('category', uploadCategory);

            const res = await fetch('/api/cloud-images', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setUploadDialogOpen(false);
                setUploadFile(null);
                setUploadName('');
                setUploadDesc('');
                setUploadCategory('');
                fetchImages();
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const res = await fetch(`/api/cloud-images?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchImages();
            }
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    return (
        <Box mt={4} width="100%">
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={2} alignItems="center" width="100%" pr={2}>
                        <ImageRoundedIcon color="primary" />
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Cloud Image Gallery
                        </Typography>
                        <Button
                            startIcon={<CloudUploadIcon />}
                            variant="contained"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setUploadDialogOpen(true);
                            }}
                        >
                            Upload New
                        </Button>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <Box mb={3}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search images by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: loading && <CircularProgress size={20} />,
                            }}
                        />
                    </Box>

                    <Grid container spacing={2}>
                        {images.length === 0 && !loading ? (
                            <Grid size={12}>
                                <Box py={4} textAlign="center" color="text.secondary">
                                    <Typography>No images found in cloud storage.</Typography>
                                </Box>
                            </Grid>
                        ) : (
                            images.map((img) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={img.id}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            cursor: onSelect ? 'pointer' : 'default',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: onSelect ? 'translateY(-4px)' : 'none',
                                                boxShadow: onSelect ? 4 : 'none',
                                                borderColor: onSelect ? 'primary.main' : 'divider',
                                            }
                                        }}
                                        onClick={() => onSelect?.(img.url)}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={img.url}
                                            alt={img.name}
                                            sx={{ objectFit: 'contain', bgcolor: 'grey.50', p: 1 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Typography variant="subtitle2" noWrap sx={{ maxWidth: '80%' }}>
                                                    {img.name}
                                                </Typography>
                                                <IconButton size="small" onClick={(e) => handleDelete(img.id, e)} color="error">
                                                    <DeleteIcon fontSize="inherit" />
                                                </IconButton>
                                            </Stack>
                                            {img.category && (
                                                <Chip label={img.category} size="small" sx={{ mt: 0.5, mb: 1, fontSize: '0.7rem' }} />
                                            )}
                                            {img.description && (
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {img.description}
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Image to Cloud</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} mt={1}>
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="cloud-upload-file"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setUploadFile(file);
                                        if (!uploadName) setUploadName(file.name);
                                    }
                                }}
                            />
                            <label htmlFor="cloud-upload-file">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    fullWidth
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ height: 100, borderStyle: 'dashed' }}
                                >
                                    {uploadFile ? uploadFile.name : 'Select Image'}
                                </Button>
                            </label>
                        </Box>

                        <TextField
                            label="Image Name (Optional)"
                            fullWidth
                            size="small"
                            value={uploadName}
                            onChange={(e) => setUploadName(e.target.value)}
                            placeholder="e.g. Vacation Poster"
                        />

                        <TextField
                            label="Category (Optional)"
                            fullWidth
                            size="small"
                            value={uploadCategory}
                            onChange={(e) => setUploadCategory(e.target.value)}
                            placeholder="e.g. Nature, Abstract, Poster"
                        />

                        <TextField
                            label="Description (Optional)"
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                            value={uploadDesc}
                            onChange={(e) => setUploadDesc(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button
                        disabled={!uploadFile || uploading}
                        onClick={handleUpload}
                        variant="contained"
                        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CloudImageGallery;
