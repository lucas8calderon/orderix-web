import { Alert, Button, Box } from '@mui/material';

export function GenericError({ onTryAgain, message = 'Não foi possível carregar os dados. Tente novamente.' }) {
  return <Box sx={{ py: 3 }}><Alert severity="error" action={onTryAgain ? <Button color="inherit" onClick={onTryAgain}>Tentar novamente</Button> : undefined}>{message}</Alert></Box>;
}
