
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
            gap={2}
        >
            <CircularProgress size={40} thickness={4} />
            <Typography variant="body2" color="text.secondary">
                Loading...
            </Typography>
        </Box>
    );
}
