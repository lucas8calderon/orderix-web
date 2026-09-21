import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ScheduleOutlined as ScheduleIcon,
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
import { SettingsSectionCard } from './SettingsSectionCard';

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
    <SettingsSectionCard
      icon={ScheduleIcon}
      title="Horários de funcionamento"
      description="Defina intervalos por dia. Clientes veem o cardápio mesmo fechado, mas não conseguem enviar pedido."
      actionLabel={saving ? 'Salvando...' : 'Salvar'}
      onAction={() => onSave('hours')}
      actionDisabled={saving}
    >
      <Box sx={{ mb: 2 }}>
        <Chip
          label={previewOpen ? 'Aberto agora' : 'Fechado no momento'}
          color={previewOpen ? 'success' : 'default'}
          size="small"
          className="status-chip"
        />
      </Box>

      <Box className="hours-day-list">
        {WEEKDAY_OPTIONS.map((option) => {
          const day = schedule.find((item) => item.weekday === option.id) || {
            weekday: option.id,
            enabled: false,
            intervals: [],
          };
          return (
            <Box key={option.id} className={`hours-day-row${!day.enabled ? ' is-disabled' : ''}`}>
              <Box className="hours-day-row__head">
                <FormControlLabel
                  control={(
                    <Switch
                      checked={Boolean(day.enabled)}
                      onChange={(e) => setDayEnabled(option.id, e.target.checked)}
                      sx={switchStyles}
                    />
                  )}
                  label={option.label}
                  className="hours-day-row__toggle"
                />
                <Typography variant="caption" color="text.secondary" className="hours-day-row__summary">
                  {formatDayHours(day)}
                </Typography>
              </Box>

              {day.enabled ? (
                <Box className="hours-day-row__intervals">
                  {day.intervals.map((interval, index) => (
                    <Box key={`${option.id}-${index}`} className="hours-interval">
                      <TextField
                        label="Abre"
                        type="time"
                        size="small"
                        value={interval.open || '08:00'}
                        onChange={(e) => setIntervalField(option.id, index, 'open', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 60 }}
                      />
                      <Typography component="span" className="hours-interval__sep" aria-hidden>
                        —
                      </Typography>
                      <TextField
                        label="Fecha"
                        type="time"
                        size="small"
                        value={interval.close || '22:00'}
                        onChange={(e) => setIntervalField(option.id, index, 'close', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 60 }}
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
                    className="hours-add-interval"
                  >
                    Adicionar intervalo
                  </Button>
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </SettingsSectionCard>
  );
});
