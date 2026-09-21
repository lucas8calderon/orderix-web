import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Save as SaveIcon, Edit as EditIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

/**
 * Shell padrão dos cards de configuração (título + ação Salvar/Editar/link).
 */
export function SettingsSectionCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionVariant = 'save',
  onAction,
  actionDisabled,
  children,
  className = '',
  compact = false,
}) {
  const isLink = actionVariant === 'link';
  const isEdit = actionVariant === 'edit';

  return (
    <Card className={`settings-card${compact ? ' settings-card--compact' : ''} ${className}`.trim()}>
      <CardContent>
        <Box className="card-header">
          <Box className="card-title-section">
            {Icon ? <Icon className="card-icon" /> : null}
            <Box className="card-title-stack">
              <Typography className="card-title">{title}</Typography>
              {description ? (
                <Typography className="card-description" variant="body2">
                  {description}
                </Typography>
              ) : null}
            </Box>
          </Box>
          {onAction && actionLabel ? (
            isLink ? (
              <Button
                className="settings-link-button"
                endIcon={<ChevronRightIcon />}
                onClick={onAction}
                disabled={actionDisabled}
              >
                {actionLabel}
              </Button>
            ) : (
              <Button
                className={isEdit ? 'edit-button' : 'save-button'}
                startIcon={isEdit ? <EditIcon /> : <SaveIcon />}
                onClick={onAction}
                disabled={actionDisabled}
                variant={isEdit ? 'outlined' : 'contained'}
              >
                {actionLabel}
              </Button>
            )
          ) : null}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}
