import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { Alert, Badge, Fab, Snackbar, Tooltip } from '@mui/material';

function ordersLabel(count) {
  return count === 1 ? '1 pedido novo' : `${count} pedidos novos`;
}

export function NewOrderAlertButton({ count, toastOpen, onOpen, onDismissToast }) {
  return (
    <>
      {count > 0 ? (
        <Badge
          badgeContent={count}
          color="error"
          overlap="circular"
          sx={{
            position: 'fixed',
            right: 24,
            bottom: 96,
            zIndex: 1200,
          }}
        >
          <Tooltip title="Pedidos novos">
            <Fab
              aria-label={ordersLabel(count)}
              onClick={onOpen}
              sx={{
                bgcolor: 'var(--color-primary, #2563EB)',
                color: '#fff',
                '&:hover': { bgcolor: 'var(--color-primary-dark, #1D4ED8)' },
              }}
            >
              <NotificationsNoneOutlinedIcon />
            </Fab>
          </Tooltip>
        </Badge>
      ) : null}
      <Snackbar
        open={Boolean(toastOpen)}
        autoHideDuration={2500}
        onClose={onDismissToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={onDismissToast} sx={{ width: '100%' }}>
          Novo pedido
        </Alert>
      </Snackbar>
    </>
  );
}
