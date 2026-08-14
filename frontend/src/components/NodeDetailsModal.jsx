import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const NODE_COLORS = {
  Person: '#6366f1',
  Skill: '#10b981',
  Company: '#f59e0b',
  Location: '#06b6d4',
  Project: '#ec4899'
};

export default function NodeDetailsModal({ node, open, onClose }) {
  if (!open || !node) return null;

  const label = node.label || 'Node';
  const color = NODE_COLORS[label] || '#9ca3af';
  const props = node.properties || {};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          color: '#f3f4f6',
          border: `2px solid ${color}`,
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Chip label={label} size="small" sx={{ bgcolor: color, color: '#ffffff', fontWeight: 700 }} />
          <Typography variant="h6" fontWeight={700}>
            {props.name || props.city || props.id}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#9ca3af' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        <Typography variant="subtitle2" color="#9ca3af" mb={2}>
          GRAPH NODE PROPERTIES:
        </Typography>

        <Grid container spacing={2}>
          {Object.entries(props).map(([key, value]) => {
            if (key.startsWith('_')) return null; // skip internal meta props
            return (
              <Grid item xs={12} sm={6} key={key}>
                <Box p={1.5} sx={{ bgcolor: 'rgba(31, 41, 55, 0.5)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Typography variant="caption" color="#9ca3af" fontWeight={600} display="block">
                    {key.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="#ffffff" sx={{ wordBreak: 'break-word' }}>
                    {String(value)}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
