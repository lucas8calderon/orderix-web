import { Box, CircularProgress, Typography } from '@mui/material';

export function Loading({ loadingMessage }) {
    return (
        <Box display="block" justifyContent="center" alignItems="center" height="80vh">
            <Typography variant="h6" sx={{ marginBottom: 4, marginLeft: 10 }}>{loadingMessage}</Typography>
            <CircularProgress 
                sx={{ 
                    marginLeft: 20,
                    color: 'var(--color-primary)'
                }} 
            />
        </Box>
    );
}