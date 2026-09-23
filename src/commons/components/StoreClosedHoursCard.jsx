import { useId, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatDayHours } from '../../services/storeHoursService';
import './StoreClosedHoursCard.css';

/**
 * Banner de loja fechada com horários expansíveis (inicia recolhido).
 * @param {'delivery' | 'menu'} [variant]
 */
export default function StoreClosedHoursCard({
  title,
  copy,
  scheduleRows = [],
  variant = 'delivery',
}) {
  const [expanded, setExpanded] = useState(false);
  const reactId = useId();
  const panelId = `store-closed-hours-${reactId}`;
  const hasHours = Array.isArray(scheduleRows) && scheduleRows.length > 0;
  const rootClass = [
    'store-closed-hours-card',
    `store-closed-hours-card--${variant}`,
    hasHours ? 'has-hours' : '',
    expanded ? 'is-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const toggle = () => setExpanded((value) => !value);

  return (
    <Box className={rootClass} role="status">
      {hasHours ? (
        <button
          type="button"
          className="store-closed-hours-card__toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={toggle}
        >
          <span className="store-closed-hours-card__summary">
            <Typography className="store-closed-hours-card__title">{title}</Typography>
            <Typography className="store-closed-hours-card__copy">{copy}</Typography>
          </span>
          <ExpandMoreIcon
            className="store-closed-hours-card__chevron"
            aria-hidden="true"
            fontSize="small"
          />
        </button>
      ) : (
        <Box className="store-closed-hours-card__summary">
          <Typography className="store-closed-hours-card__title">{title}</Typography>
          <Typography className="store-closed-hours-card__copy">{copy}</Typography>
        </Box>
      )}

      {hasHours && expanded ? (
        <Box
          id={panelId}
          className="store-closed-hours-card__panel"
          role="region"
          aria-label="Horários de funcionamento"
        >
          {scheduleRows.map((day) => (
            <Box key={day.id} className="store-closed-hours-card__row">
              <Typography component="span" className="store-closed-hours-card__day">
                {day.label}
              </Typography>
              <Typography component="span" className="store-closed-hours-card__value">
                {formatDayHours(day)}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
