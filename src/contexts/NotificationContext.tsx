"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

type NotificationContextType = {
    showNotification: (message: string, severity?: AlertColor) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<AlertColor>("info");

    const showNotification = useCallback((msg: string, sev: AlertColor = "info") => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    }, []);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") {
            return;
        }
        setOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};
