import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import {
  createDefaultSchedule,
  formatDayHours,
  isStoreOpenNow,
  normalizeSchedule,
  normalizeTime,
  WEEKDAY_OPTIONS,
} from '../../../../services/storeHoursService';

function cloneSchedule(schedule) {
  return normalizeSchedule(schedule?.length ? schedule : createDefaultSchedule()).map((day) => ({
    ...day,
    intervals: day.intervals.map((interval) => ({ ...interval })),
  }));
}

export const HoursCard = React.memo(function HoursCard({
  settings,
  onSettingChange,
  onSave,
  switchStyles,
  saving,
}) {
  const schedule = useMemo(
    () => normalizeSchedule(settings?.schedule?.length ? settings.schedule : createDefaultSchedule()),
    [settings?.schedule]
  );

  const previewOpen = useMemo(
    () => isStoreOpenNow({ schedule }),
    [schedule]
  );

  const updateSchedule = (next) => {
    onSettingChange('schedule', null, normalizeSchedule(next));
  };

  const setDayEnabled = (weekday, enabled) => {
    const next = cloneSchedule(schedule);
    const day = next.find((item) => item.weekday === weekday);
    if (!day) return;
    day.enabled = enabled;
    if (enabled && day.intervals.length === 0) {
      day.intervals = [{ open: '08:00', close: '22:00' }];
    }
    if (!enabled) {
      day.intervals = [];
    }
    updateSchedule(next);
  };

  const setIntervalField = (weekday, index, field, value) => {
    const next = cloneSchedule(schedule);
    const day = next.find((item) => item.weekday === weekday);
    if (!day?.intervals[index]) return;
    day.intervals[index] = {
      ...day.intervals[index],
      [field]: normalizeTime(value, field === 'open' ? '08:00' : '22:00'),
    };
    day.enabled = true;
    updateSchedule(next);
  };

  const addInterval = (weekday) => {
    const next = cloneSchedule(schedule);
    const day = next.find((item) => item.weekday === weekday);
    if (!day) return;
    day.enabled = true;
    day.intervals = [...day.intervals, { open: '08:00', close: '22:00' }];
    updateSchedule(next);
  };

  const removeInterval = (weekday, index) => {
    const next = cloneSchedule(schedule);
    const day = next.find((item) => item.weekday === weekday);
    if (!day) return;
    day.intervals = day.intervals.filter((_, i) => i !== index);
    if (day.intervals.length === 0) {
      day.enabled = false;
    }
    updateSchedule(next);
  };

  return (
    <Card className="settings-card">
      <CardContent>
        <Box className="card-header">
          <Box className="card-title-section">
            <ScheduleIcon className="card-icon" />
            <Typography className="card-title">Horários de funcionamento</Typography>
          </Box>
          <Button
            className="save-button"
            startIcon={<SaveIcon />}
            onClick={() => onSave('hours')}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Defina intervalos por dia. Clientes veem o cardápio mesmo fechado, mas não conseguem enviar pedido.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={previewOpen ? 'Aberto agora' : 'Fechado no momento'}
            color={previewOpen ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 2 }}>
          {WEEKDAY_OPTIONS.map((option) => {
            const day = schedule.find((item) => item.weekday === option.id) || {
              weekday: option.id,
              enabled: false,
              intervals: [],
            };
            return (
              <Box
                key={option.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(day.enabled)}
                        onChange={(e) => setDayEnabled(option.id, e.target.checked)}
                        sx={switchStyles}
                      />
                    }
                    label={option.label}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDayHours(day)}
                  </Typography>
                </Box>

                {day.enabled ? (
                  <Box sx={{ mt: 1.5, display: 'grid', gap: 1 }}>
                    {day.intervals.map((interval, index) => (
                      <Box
                        key={`${option.id}-${index}`}
                        sx={{
                          display: 'grid',
                          gap: 1,
                          gridTemplateColumns: { xs: '1fr 1fr auto', sm: '1fr 1fr auto' },
                          alignItems: 'center',
                        }}
                      >
                        <TextField
                          label="Abre"
                          type="time"
                          size="small"
                          value={interval.open || '08:00'}
                          onChange={(e) => setIntervalField(option.id, index, 'open', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 60 }}
                          fullWidth
                        />
                        <TextField
                          label="Fecha"
                          type="time"
                          size="small"
                          value={interval.close || '22:00'}
                          onChange={(e) => setIntervalField(option.id, index, 'close', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 60 }}
                          fullWidth
                        />
                        <IconButton
                          aria-label={`Remover intervalo de ${option.label}`}
                          onClick={() => removeInterval(option.id, index)}
                          size="small"
                          disabled={day.intervals.length <= 1}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addInterval(option.id)}
                      sx={{ justifyContent: 'flex-start', width: 'fit-content' }}
                    >
                      Adicionar intervalo
                    </Button>
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Box>

        <Box className="setting-item" sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(settings?.deliveryEnabled)}
                onChange={(e) => onSettingChange('deliveryEnabled', null, e.target.checked)}
                sx={switchStyles}
              />
            }
            label="Atender por delivery"
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Desative para pausar o canal de delivery sem alterar o horário da loja.
        </Typography>
      </CardContent>
    </Card>
  );
});
