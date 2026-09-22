import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { CRM_BUSINESS_TYPES, businessTypeLabel, statusLabel } from '../crmConstants';
import { createGooglePlacesProspectingClient } from '../prospecting/GooglePlacesProspectingProvider';
import { openWhatsApp } from '../whatsappTemplate';

const prospectingClient = createGooglePlacesProspectingClient();

function usageTone(percent) {
  if (percent >= 90) return { label: 'Alerta', severity: 'error' };
  if (percent >= 70) return { label: 'Atenção', severity: 'warning' };
  return { label: 'Normal', severity: 'success' };
}

function UsageMeter({ title, used, limit, percent }) {
  const tone = usageTone(percent || 0);
  return (
    <Box className="crm-places-usage-meter">
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{title}</Typography>
        <Typography variant="body2">{`${used} / ${limit}`}</Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, percent || 0)}
        color={tone.severity}
        aria-label={`${title}: ${used} de ${limit}, ${tone.label}`}
        sx={{ height: 8, borderRadius: 999, my: 0.75 }}
      />
      <Typography variant="caption" color="text.secondary">{tone.label}</Typography>
    </Box>
  );
}

function formatRenewal(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
}

function errorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

function isMonthlyLimit(message) {
  return String(message || '').includes('limite interno da Weper');
}

export function CrmProspectingDialog({ open, onClose, onImported, onOpenLead }) {
  const dialogProps = useDialogResponsiveProps();
  const [businessType, setBusinessType] = useState('HAMBURGER');
  const [region, setRegion] = useState('São José dos Campos - SP');
  const [limit, setLimit] = useState(20);
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState({});
  const [banner, setBanner] = useState(null);
  const [readyToContact, setReadyToContact] = useState([]);

  const maxResults = usage?.maxResults || 20;
  const limitOptions = useMemo(() => {
    const options = [5, 10, 20].filter((value) => value <= maxResults);
    if (!options.includes(maxResults)) options.push(maxResults);
    return options;
  }, [maxResults]);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setSelected({});
    setBanner(null);
    setReadyToContact([]);
    setLoadingUsage(true);
    prospectingClient.usage()
      .then((data) => {
        setUsage(data);
        if (data?.maxResults) {
          setLimit((current) => Math.min(current, data.maxResults));
        }
      })
      .catch((err) => {
        setBanner({ severity: 'error', message: errorMessage(err, 'Não foi possível carregar o consumo.') });
      })
      .finally(() => setLoadingUsage(false));
  }, [open]);

  const newPlaces = (result?.results || []).filter((place) => !place.existingInCrm);
  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const selectedCount = selectedIds.length;
  const busy = loading || importing;

  const handleSearch = async () => {
    if (busy) return;
    setLoading(true);
    setBanner(null);
    setResult(null);
    setSelected({});
    setReadyToContact([]);
    try {
      const data = await prospectingClient.search({ businessType, region, limit });
      setResult(data);
      if (data?.available === false) {
        setBanner({
          severity: isMonthlyLimit(data.message) ? 'error' : 'warning',
          title: isMonthlyLimit(data.message) ? 'Limite mensal de prospecção atingido' : undefined,
          message: data.message || 'Google Places não configurado.',
        });
      } else if (!data?.results?.length) {
        setBanner({
          severity: 'info',
          title: 'Nenhum estabelecimento encontrado',
          message: 'Tente alterar o segmento ou a região.',
        });
      }
      const nextUsage = await prospectingClient.usage().catch(() => null);
      if (nextUsage) setUsage(nextUsage);
    } catch (err) {
      const message = errorMessage(err, 'Não foi possível buscar estabelecimentos.');
      setBanner({
        severity: 'error',
        title: isMonthlyLimit(message) ? 'Limite mensal de prospecção atingido' : undefined,
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlace = (place) => {
    if (place.existingInCrm || busy) return;
    setSelected((current) => ({ ...current, [place.externalId]: !current[place.externalId] }));
  };

  const selectAllNew = () => {
    const next = {};
    newPlaces.forEach((place) => {
      next[place.externalId] = true;
    });
    setSelected(next);
  };

  const clearSelection = () => setSelected({});

  const handleImport = async () => {
    if (busy || selectedCount === 0) return;
    setImporting(true);
    setBanner(null);
    try {
      const places = (result?.results || [])
        .filter((place) => selected[place.externalId] && !place.existingInCrm)
        .map((place) => ({
          externalId: place.externalId,
          name: place.name,
          address: place.address,
          city: place.city,
          state: place.state,
        }));
      const data = await prospectingClient.importPlaces({ businessType, places });
      const imported = (data.items || []).filter((item) => item.outcome === 'IMPORTED');
      setReadyToContact(imported);
      const withPhone = imported.filter((item) => item.lead?.phone).length;
      const withoutPhone = imported.length - withPhone;
      const message = [
        `${data.imported} leads adicionados.`,
        withPhone ? `${withPhone} com telefone para WhatsApp.` : null,
        withoutPhone ? `${withoutPhone} sem telefone no Google.` : null,
        data.duplicates ? `${data.duplicates} já estava cadastrado.` : null,
        data.failed ? `${data.failed} não pôde ser consultado.` : null,
      ].filter(Boolean).join(' ');
      setBanner({
        severity: data.failed || withoutPhone ? 'warning' : 'success',
        message,
      });
      setSelected({});
      if (result?.results) {
        const importedIds = new Set((data.items || [])
          .filter((item) => item.outcome === 'IMPORTED' || item.outcome === 'DUPLICATE')
          .map((item) => item.externalId));
        setResult((current) => ({
          ...current,
          results: (current.results || []).map((place) => {
            const item = (data.items || []).find((entry) => entry.externalId === place.externalId);
            if (!item || !importedIds.has(place.externalId)) return place;
            return {
              ...place,
              existingInCrm: true,
              leadId: item.leadId,
              status: item.lead?.status || place.status,
              statusLabel: item.lead?.statusLabel || statusLabel(item.lead?.status) || place.statusLabel,
            };
          }),
          newCount: Math.max(0, (current.newCount || 0) - (data.imported || 0)),
          existingCount: (current.existingCount || 0) + (data.imported || 0) + (data.duplicates || 0),
        }));
      }
      const nextUsage = await prospectingClient.usage().catch(() => null);
      if (nextUsage) setUsage(nextUsage);
      if (onImported) await onImported(data);
    } catch (err) {
      const message = errorMessage(err, 'Não foi possível importar os estabelecimentos.');
      setBanner({
        severity: 'error',
        title: isMonthlyLimit(message) ? 'Limite mensal de prospecção atingido' : undefined,
        message,
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="md" fullWidth {...dialogProps}>
      <DialogTitle>
        Encontrar potenciais clientes
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.5 }}>
          O telefone só é consultado dos selecionados. Depois você abre o WhatsApp para o primeiro contato.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Box className="crm-places-usage">
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Uso Google Places</Typography>
            {loadingUsage && !usage ? (
              <LinearProgress sx={{ mt: 1 }} />
            ) : (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <UsageMeter
                      title="Pesquisas"
                      used={usage?.searchUsed ?? 0}
                      limit={usage?.searchLimit ?? 500}
                      percent={usage?.searchPercent}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <UsageMeter
                      title="Detalhes"
                      used={usage?.detailsUsed ?? 0}
                      limit={usage?.detailsLimit ?? 500}
                      percent={usage?.detailsPercent}
                    />
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Período: {usage?.periodLabel || '—'}. Próxima renovação interna: {formatRenewal(usage?.renewsOn)}.
                </Typography>
                {!usage?.configured && (
                  <Alert severity="warning" sx={{ mt: 1 }}>Google Places não configurado.</Alert>
                )}
              </>
            )}
          </Box>

          <FormControl fullWidth disabled={busy}>
            <InputLabel>Segmento</InputLabel>
            <Select label="Segmento" value={businessType} onChange={(event) => setBusinessType(event.target.value)}>
              {CRM_BUSINESS_TYPES.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Região"
            value={region}
            disabled={busy}
            onChange={(event) => setRegion(event.target.value)}
          />
          <FormControl fullWidth disabled={busy}>
            <InputLabel>Quantidade</InputLabel>
            <Select label="Quantidade" value={Math.min(limit, maxResults)} onChange={(event) => setLimit(Number(event.target.value))}>
              {limitOptions.map((value) => (
                <MenuItem key={value} value={value}>{value}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={busy || !region.trim()}
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
              minHeight: 44,
            }}
          >
            {loading ? 'Buscando...' : 'Buscar estabelecimentos'}
          </Button>

          {readyToContact.length > 0 && (
            <Box className="crm-places-contact">
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Pronto para contato</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Telefone do Google não confirma WhatsApp. O envio continua manual.
              </Typography>
              <Stack spacing={1}>
                {readyToContact.map((item) => {
                  const phone = item.lead?.phone;
                  return (
                    <Box key={item.externalId || item.leadId} className="crm-places-card is-contact">
                      <Typography sx={{ fontWeight: 700 }}>{item.name || item.lead?.businessName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {phone ? `Telefone disponível: ${phone}` : 'Telefone não disponível'}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={!phone}
                          onClick={() => openWhatsApp(item.lead?.whatsAppUrl || phone)}
                          sx={{
                            textTransform: 'none',
                            backgroundColor: 'var(--color-primary)',
                            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
                          }}
                        >
                          Abrir no WhatsApp
                        </Button>
                        {item.leadId && (
                          <Button size="small" sx={{ textTransform: 'none' }} onClick={() => onOpenLead && onOpenLead(item.leadId)}>
                            Ver lead
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {banner && (
            <Alert severity={banner.severity}>
              {banner.title && <Typography sx={{ fontWeight: 700 }}>{banner.title}</Typography>}
              {banner.message}
            </Alert>
          )}

          {result?.available && result.results?.length > 0 && (
            <>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`${result.foundCount ?? result.results.length} estabelecimentos encontrados`} />
                <Chip color="success" variant="outlined" label={`${result.newCount ?? newPlaces.length} novos`} />
                <Chip variant="outlined" label={`${result.existingCount ?? result.results.length - newPlaces.length} já cadastrados`} />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button size="small" onClick={selectAllNew} disabled={busy || newPlaces.length === 0} sx={{ textTransform: 'none' }}>
                  Selecionar todos os novos
                </Button>
                <Button size="small" onClick={clearSelection} disabled={busy || selectedCount === 0} sx={{ textTransform: 'none' }}>
                  Desmarcar todos
                </Button>
                <Typography variant="body2" color="text.secondary">{selectedCount} selecionados</Typography>
              </Stack>
              <Stack spacing={1}>
                {result.results.map((place) => {
                  const checked = Boolean(selected[place.externalId]);
                  return (
                    <Box
                      key={place.externalId}
                      className={`crm-places-card${place.existingInCrm ? ' is-existing' : ''}${checked ? ' is-selected' : ''}`}
                    >
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Checkbox
                          checked={checked}
                          disabled={place.existingInCrm || busy}
                          onChange={() => togglePlace(place)}
                          inputProps={{ 'aria-label': `Selecionar ${place.name}` }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700 }}>{place.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {place.businessTypeLabel || businessTypeLabel(businessType)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {place.address || [place.city, place.state].filter(Boolean).join(' - ') || '—'}
                          </Typography>
                          {place.existingInCrm ? (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                              <Chip size="small" color="success" label="Já está no CRM" />
                              <Typography variant="caption" color="text.secondary">
                                Status: {place.statusLabel || statusLabel(place.status)}
                              </Typography>
                              <Button
                                size="small"
                                sx={{ textTransform: 'none' }}
                                onClick={() => onOpenLead && onOpenLead(place.leadId)}
                              >
                                Ver lead
                              </Button>
                            </Stack>
                          ) : (
                            <Chip size="small" sx={{ mt: 1 }} label="Novo no CRM" />
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </>
          )}

          {busy && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <CircularProgress size={22} sx={{ color: 'var(--color-primary)' }} />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} disabled={busy} sx={{ textTransform: 'none' }}>Fechar</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={busy || selectedCount === 0}
          sx={{
            textTransform: 'none',
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          {importing ? 'Consultando telefone...' : 'Buscar telefone e adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
