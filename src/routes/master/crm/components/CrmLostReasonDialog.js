import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { CRM_LOST_REASONS } from '../crmConstants';

export function CrmLostReasonDialog({ open, onClose, onConfirm, saving }) {
  const [lostReason, setLostReason] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setLostReason('');
      setReason('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Motivo do encerramento</DialogTitle>
      <DialogContent>
        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
          <InputLabel>Motivo</InputLabel>
          <Select
            label="Motivo"
            value={lostReason}
            onChange={(event) => setLostReason(event.target.value)}
          >
            {CRM_LOST_REASONS.map((item) => (
              <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          size="small"
          label="Detalhe (opcional)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          sx={{ mt: 1.5 }}
          multiline
          minRows={2}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          disabled={saving || !lostReason}
          onClick={() => onConfirm({ lostReason, reason: reason.trim() || undefined })}
          sx={{ textTransform: 'none' }}
        >
          Marcar como perdido
        </Button>
      </DialogActions>
    </Dialog>
  );
}
