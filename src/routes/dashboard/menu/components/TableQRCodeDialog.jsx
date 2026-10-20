import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { Download, X } from "lucide-react";
import { useIsMobile, useDialogResponsiveProps } from "../../../../commons/hooks/useResponsive";
import { QrDownloadControls } from "../../../../commons/qr/QrDownloadControls";

export function TableQRCodeDialog({ open, onClose, table }) {
  const isMobile = useIsMobile();
  const dialogProps = useDialogResponsiveProps({
    fullScreenOnMobile: false,
  });
  const qrSize = isMobile ? 200 : 256;

  const tableData = table ? JSON.stringify({
    tableId: table.id,
    tableNumber: table.number,
    capacity: table.capacity
  }) : "";

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      {...dialogProps}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ pr: 1, wordBreak: 'break-word' }}>
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
                size={qrSize}
                level="H"
                includeMargin={true}
              />
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, mb: 2 }}>
            Mesa {table?.number} - Capacidade: {table?.capacity} {table?.capacity === 1 ? 'pessoa' : 'pessoas'}
          </Typography>

          <QrDownloadControls
            value={tableData}
            fileName={`mesa-${table?.number}`}
            level="H"
            buttonVariant="contained"
            fullWidth={isMobile}
            startIcon={<Download size={18} />}
            buttonSx={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-white)",
              ":hover": {
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-black)",
              },
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
