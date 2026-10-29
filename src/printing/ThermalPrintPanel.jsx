import React, { useState } from 'react';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { Alert, Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { diagnosticReport, openThermalPrint, TEST_ACCOUNT, thermalEnabled } from './thermalPrint';

const RESULTS = [
  'Ainda não testei',
  'Imprimiu corretamente',
  'Imprimiu, mas o layout ficou incorreto',
  'Não conseguiu imprimir',
  'Cancelei a impressão',
];

export function ThermalPrintPanel({ account, placeLabel = '' }) {
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState('Ainda não testei');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('info');
  const [report, setReport] = useState('');
  if (!thermalEnabled()) return null;
  const print = () => {
    setResult('Ainda não testei');
    setReport('');
    try {
      setAttempt(openThermalPrint(account || TEST_ACCOUNT, { test: !account, placeLabel: account ? placeLabel : '' }));
      setTone('info');
      setMessage('A janela de impressão foi aberta. Isso não confirma que o papel saiu. Se você cancelar essa janela, nada é impresso: escolha "Cancelei a impressão".');
    } catch (error) {
      setAttempt({ state: 'error', time: new Date().toISOString() });
      setTone('error');
      setMessage(error.message);
    }
  };
  const copy = async () => {
    const text = diagnosticReport({ result, notes, attempt });
    setReport(text);
    setTone('info');
    try { await navigator.clipboard.writeText(text); setMessage('Relatório copiado. Envie para o suporte Weper.'); }
    catch { setMessage('Selecione e copie o relatório abaixo para enviar ao suporte.'); }
  };
  if (account) {
    return <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
      <Button type="button" variant="outlined" startIcon={<PrintOutlinedIcon />} onClick={print} sx={{ textTransform: 'none' }}>Imprimir</Button>
      {tone === 'error' && message && <Alert severity="error" role="alert">{message}</Alert>}
    </Box>;
  }
  return <Box sx={{ my: 2, p: 2, maxWidth: 880, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Typography component="h2" variant="h6">Impressão térmica USB — 80 mm</Typography>
    <Typography variant="body2">No Windows, instale o driver da KP-IM609 e imprima a página de teste do sistema. No Chrome ou Edge, selecione a impressora, papel 80 mm, escala 100%, margens nenhuma e desative cabeçalhos e rodapés.</Typography>
    <Typography variant="body2">
      {account
        ? 'A comanda lista os itens desta tela. Imprimir não cobra, não fecha a conta e não altera o pedido.'
        : 'O teste não usa pedido de cliente. A janela do navegador não confirma a saída no papel.'}
    </Typography>
    <Typography variant="body2">Não inclua dados de clientes no diagnóstico. A confirmação física é sua, no papel.</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      <Button type="button" variant={account ? 'outlined' : 'contained'} onClick={print}>{account ? 'Imprimir comanda 80 mm' : 'Imprimir teste KP-IM609'}</Button>
      <Button type="button" variant="outlined" onClick={copy}>Copiar relatório de teste</Button>
    </Box>
    <TextField select fullWidth label="Resultado no papel" value={result} onChange={e => { setResult(e.target.value); setReport(''); }} margin="none">
      {RESULTS.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
    </TextField>
    <TextField fullWidth multiline label="Observações do teste" value={notes} onChange={e => { setNotes(e.target.value); setReport(''); }} inputProps={{ maxLength: 1500 }} />
    {message && <Alert severity={tone === 'error' ? 'error' : 'info'} role={tone === 'error' ? 'alert' : 'status'}>{message}</Alert>}
    {report && <TextField label="Relatório para suporte" fullWidth multiline value={report} InputProps={{ readOnly: true }} />}
  </Box>;
}
