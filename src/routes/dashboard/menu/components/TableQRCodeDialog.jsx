import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { Download, X } from "lucide-react";

export function TableQRCodeDialog({ open, onClose, table }) {
  const [downloading, setDownloading] = useState(false);

  // Gerar dados da mesa para o QR Code (JSON com id e número da mesa)
  const tableData = table ? JSON.stringify({
    tableId: table.id,
    tableNumber: table.number,
    capacity: table.capacity
  }) : "";

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const QRCode = await import('qrcode');
      const url = await QRCode.toDataURL(tableData, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      // Criar link de download
      const link = document.createElement('a');
      link.download = `mesa-${table.number}.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            QR Code - Mesa {table?.number}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use este QR Code para identificar a mesa ao fazer pedidos
          </Typography>
          
          {table && (
            <Box
              sx={{
                p: 3,
                border: '2px solid #e0e0e0',
                borderRadius: 2,
                bgcolor: 'white',
                display: 'inline-block'
              }}
            >
              <QRCodeSVG 
                value={tableData} 
                size={256}
                level="H"
                includeMargin={true}
              />
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, mb: 2 }}>
            Mesa {table?.number} - Capacidade: {table?.capacity} {table?.capacity === 1 ? 'pessoa' : 'pessoas'}
          </Typography>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
            disabled={downloading}
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-white)",
              ":hover": {
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-black)",
              },
            }}
          >
            {downloading ? 'Baixando...' : 'Baixar QR Code'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

