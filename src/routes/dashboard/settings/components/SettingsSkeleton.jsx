import React from 'react';
import { Box, Skeleton } from '@mui/material';

export function SettingsSkeleton() {
  return (
    <div className="settings-container" aria-busy="true" aria-label="Carregando configurações">
      <Box className="settings-header settings-header--page">
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={36} />
          <Skeleton variant="text" width="60%" height={22} />
        </Box>
      </Box>
      <Box className="settings-nav settings-nav--skeleton">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={110} height={36} sx={{ borderRadius: 999 }} />
        ))}
      </Box>
      <div className="settings-section-panel">
        <div className="settings-overview-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} className="settings-card settings-card--skeleton">
              <Skeleton variant="text" width="45%" height={28} />
              <Skeleton variant="rounded" height={120} sx={{ mt: 2, borderRadius: 2 }} />
              <Skeleton variant="text" width="80%" sx={{ mt: 2 }} />
              <Skeleton variant="text" width="55%" />
            </Box>
          ))}
        </div>
      </div>
    </div>
  );
}
