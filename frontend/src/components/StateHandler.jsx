import React from 'react';
import { Box, Typography, Button, Skeleton, Card, CardContent } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InboxIcon from '@mui/icons-material/Inbox';

export function LoadingSkeleton({ count = 3, height = 140 }) {
  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(auto-fill, minmax(300px, 1fr))' }} gap={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ bgcolor: 'rgba(17, 24, 39, 0.6)', border: '1px solid #1f2937', borderRadius: 2 }}>
          <CardContent>
            <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mb: 1.5 }} />
            <Skeleton variant="text" width="60%" height={28} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', mb: 2 }} />
            <Skeleton variant="rectangular" height={36} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export function EmptyState({ title = 'No results found', message = 'Try adjusting your filters or search terms.', icon }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={6}
      px={3}
      sx={{
        bgcolor: 'rgba(17, 24, 39, 0.4)',
        border: '1px dashed #374151',
        borderRadius: 3,
        textAlign: 'center'
      }}
    >
      {icon || <InboxIcon sx={{ fontSize: 48, color: '#6b7280', mb: 1.5 }} />}
      <Typography variant="h6" color="#f3f4f6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="#9ca3af" sx={{ maxWidth: 400 }}>
        {message}
      </Typography>
    </Box>
  );
}

export function ErrorBanner({ message = 'Unable to connect to SkillGraph server.', onRetry }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={4}
      px={3}
      sx={{
        bgcolor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 3,
        textAlign: 'center'
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 44, color: '#ef4444', mb: 1 }} />
      <Typography variant="h6" color="#f87171" fontWeight={600} gutterBottom>
        Network Connection Error
      </Typography>
      <Typography variant="body2" color="#d1d5db" mb={2} sx={{ maxWidth: 450 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="error" onClick={onRetry} sx={{ borderRadius: 2, textTransform: 'none' }}>
          Retry Request
        </Button>
      )}
    </Box>
  );
}
