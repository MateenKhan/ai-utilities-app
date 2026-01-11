import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Typography,
    CircularProgress,
    Box,
    ListItemButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ImageIcon from '@mui/icons-material/Image';

interface Project {
    id: string;
    name: string;
    updatedAt: string;
    imageUrl?: string;
    data: any;
}

interface SavedProjectsListProps {
    open: boolean;
    onClose: () => void;
    onLoad: (project: Project) => void;
}

export default function SavedProjectsList({ open, onClose, onLoad }: SavedProjectsListProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadProjects();
        }
    }, [open]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/image-tiles');
            if (res.ok) {
                const data = await res.json();
                setProjects(data.projects);
            }
        } catch (error) {
            console.error('Failed to load projects', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await fetch(`/api/image-tiles?id=${id}`, { method: 'DELETE' });
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Saved Image Projects</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : projects.length === 0 ? (
                    <Typography align="center" color="text.secondary" py={3}>
                        No saved projects found.
                    </Typography>
                ) : (
                    <List>
                        {projects.map((project) => (
                            <ListItem
                                key={project.id}
                                disablePadding
                                secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={(e) => handleDelete(e, project.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemButton onClick={() => onLoad(project)}>
                                    <ListItemAvatar>
                                        <Avatar variant="square" src={project.imageUrl || ''}>
                                            <ImageIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={project.name || 'Untitled Project'}
                                        secondary={new Date(project.updatedAt).toLocaleString()}
                                    />
                                    <CloudDownloadIcon color="action" sx={{ mr: 2 }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
}
