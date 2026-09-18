import React, { useContext, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Tooltip } from '@mui/material';
import { Edit, Trash2, QrCode } from 'lucide-react';
import Button from '../../menu/components/ui/Button';
import { ComandasContext } from '../provider/ComandasContext';
import { ComandaQRCodeDialog } from './ComandaQRCodeDialog';

export function CardComanda({ comanda, canManage = true }) {
  const { setOpenDeleteDialogComanda, setSelectedComanda } = useContext(ComandasContext);
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <Card
      sx={{
        cursor: 'pointer',
        display: 'flex',
        borderRadius: 4,
        width: '100%',
        maxWidth: { sm: 238 },
        minHeight: 187,
        backgroundColor: '#0000',
        boxShadow: 3,
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 8,
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          padding: 0,
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'start',
            fontWeight: 'bold',
            mt: 3,
            px: 1,
            textAlign: 'center',
            wordBreak: 'break-word',
          }}
        >
          Comanda {comanda.number ?? 'Sem número'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 4,
          }}
        >
          <Typography sx={{ fontSize: 14 }} color="#747474">
            Atendimento avulso
          </Typography>
        </Box>

        <Chip
          label={comanda.isAvailable ? 'Disponível' : 'Em uso'}
          sx={{
            fontSize: 10,
            height: 22,
            mx: 3,
            mt: 1,
            padding: '0 8px',
            backgroundColor: comanda.isAvailable ? 'green' : 'red',
            color: '#fff',
            flexShrink: 0,
          }}
        />

        {canManage && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 1,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <Button size="sm" variant="default" onClick={() => setQrOpen(true)}>
            <Tooltip title="QR autoatendimento">
              <QrCode className="h-4 w-4" size={46} />
            </Tooltip>
          </Button>

          <Button size="sm" variant="default">
            <Tooltip title="Editar">
              <Edit className="h-4 w-4" size={46} />
            </Tooltip>
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={() => {
              setSelectedComanda(comanda);
              setOpenDeleteDialogComanda(true);
            }}
          >
            <Tooltip title="Excluir">
              <Trash2 className="h-4 w-4" size={26} />
            </Tooltip>
          </Button>
        </Box>
        )}
      </CardContent>
      <ComandaQRCodeDialog open={qrOpen} onClose={() => setQrOpen(false)} comanda={comanda} />
    </Card>
  );
}
