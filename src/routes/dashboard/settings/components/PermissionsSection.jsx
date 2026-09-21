import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PeopleOutline as PeopleIcon,
} from '@mui/icons-material';
import { SettingsSectionCard } from './SettingsSectionCard';

export function PermissionsSection({
  settings,
  onPermissionChange,
  onSave,
  getProfileLabel,
  getPermissionLabel,
  switchStyles,
}) {
  const profiles = Object.keys(settings.permissions || {});
  const [expanded, setExpanded] = useState(profiles[0] || false);

  return (
    <SettingsSectionCard
      icon={PeopleIcon}
      title="Perfis e Permissões"
      description="Controle o que cada perfil pode fazer no painel. Persistência no servidor em breve."
      actionLabel="Salvar"
      onAction={() => onSave('permissions')}
    >
      <Box className="permissions-accordion">
        {Object.entries(settings.permissions).map(([profile, permissions]) => (
          <Accordion
            key={profile}
            disableGutters
            elevation={0}
            expanded={expanded === profile}
            onChange={(_, isExpanded) => setExpanded(isExpanded ? profile : false)}
            className="permissions-accordion__item"
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className="profile-title">{getProfileLabel(profile)}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box className="permissions-grid">
                {Object.entries(permissions).map(([permission, enabled]) => (
                  <FormControlLabel
                    key={`${profile}-${permission}`}
                    control={(
                      <Switch
                        checked={enabled}
                        onChange={(e) => onPermissionChange(profile, permission, e.target.checked)}
                        sx={switchStyles}
                      />
                    )}
                    label={getPermissionLabel(permission)}
                    className="permission-item"
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </SettingsSectionCard>
  );
}
