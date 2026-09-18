import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { Download, X } from "lucide-react";
import axios from "axios";
import { useIsMobile, useDialogResponsiveProps } from "../../../../commons/hooks/useResponsive";

export function ComandaQRCodeDialog({ open, onClose, comanda }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState("");
  const [comandaNumber, setComandaNumber] = useState(comanda?.number);
  const isMobile = useIsMobile();
  const dialogProps = useDialogResponsiveProps({ fullScreenOnMobile: false });
  const qrSize = isMobile ? 200 : 256;

  React.useEffect(() => {
    if (!open || !comanda?.id) {
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.post(`/comandas/${comanda.id}/order-context-token`);
        if (cancelled) return;
        setPayload(data?.qrPayload || "");
        setComandaNumber(data?.comandaNumber ?? comanda.number);
      } catch (e) {
        if (!cancelled) {
          setError("Não foi possível gerar o QR da comanda.");
          setPayload("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, comanda?.id, comanda?.number]);

  const handleDownload = async () => {
    if (!payload) return;
    try {
      const QRCode = await import("qrcode");
      const url = await QRCode.toDataURL(payload, {
        width: 512,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      const link = document.createElement("a");
      link.download = `comanda-${comandaNumber || comanda?.number}.png`;
      link.href = url;
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" {...dialogProps}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        QR Autoatendimento — Comanda {comandaNumber ?? ""}
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 1 }}>
          {loading && <CircularProgress size={32} />}
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          {!loading && payload && (
            <>
              <QRCodeSVG value={payload} size={qrSize} includeMargin />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Cliente escaneia este código no tablet para lançar o pedido nesta comanda.
              </Typography>
              <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
                {payload}
              </Typography>
              <Button variant="contained" startIcon={<Download size={16} />} onClick={handleDownload}>
                Baixar PNG
              </Button>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
