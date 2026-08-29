import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import SpeedIcon from '@mui/icons-material/Speed';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import GroupsIcon from '@mui/icons-material/Groups';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InsightsIcon from '@mui/icons-material/Insights';
import backgroundImage from '../../assets/login-bg.jpg';
import * as LoginConstants from './loginConstants';
import { PATHS } from '../../services/accessControl';

function FeatureMetric({ icon, label }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        flex: 1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'var(--color-primary-soft)',
          color: 'var(--color-primary)',
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: 'var(--color-text-secondary)',
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.2,
          fontSize: '0.7rem',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function LoginAside() {
  return (
    <Box
      className="login-aside"
      aria-hidden={false}
      sx={{
        position: 'relative',
        display: { xs: 'none', md: 'block' },
        flex: { md: '1 1 52%' },
        minHeight: { md: '100%' },
        overflow: 'hidden',
        borderRadius: { md: '0 20px 20px 0' },
      }}
    >
      <Box
        component="img"
        src={backgroundImage}
        alt=""
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(160deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.02) 40%, rgba(15,23,42,0.18) 100%)',
        }}
      />

      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          top: { md: 40, lg: 56 },
          left: { md: 28, lg: 40 },
          right: { md: 28, lg: 'auto' },
          width: { md: 'auto', lg: 320 },
          maxWidth: 'calc(100% - 56px)',
          p: 2.25,
          borderRadius: 3,
          bgcolor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.14)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              flexShrink: 0,
            }}
          >
            <InsightsIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {LoginConstants.ASIDE_CARD_TITLE}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--color-text-secondary)', mt: 0.5, lineHeight: 1.45 }}
            >
              {LoginConstants.ASIDE_CARD_DESCRIPTION}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="space-between">
          <FeatureMetric
            icon={<SpeedIcon sx={{ fontSize: 18 }} />}
            label={LoginConstants.ASIDE_METRIC_CONTROL}
          />
          <FeatureMetric
            icon={<ShowChartIcon sx={{ fontSize: 18 }} />}
            label={LoginConstants.ASIDE_METRIC_SALES}
          />
          <FeatureMetric
            icon={<GroupsIcon sx={{ fontSize: 18 }} />}
            label={LoginConstants.ASIDE_METRIC_CLIENTS}
          />
        </Stack>
      </Paper>

      <Paper
        component="a"
        href={`${PATHS.HOME}#support`}
        elevation={0}
        sx={{
          position: 'absolute',
          bottom: { md: 28, lg: 36 },
          right: { md: 24, lg: 32 },
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 2,
          py: 1.25,
          borderRadius: 999,
          textDecoration: 'none',
          bgcolor: 'rgba(255,255,255,0.92)',
          color: 'var(--color-text-primary)',
          boxShadow: '0 8px 28px rgba(15, 23, 42, 0.16)',
          border: '1px solid rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          maxWidth: 'min(280px, calc(100% - 48px))',
          'html[data-theme="dark"] &': {
            bgcolor: 'rgba(18, 26, 43, 0.92)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          },
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.2)',
          },
          '&:focus-visible': {
            outline: '2px solid var(--color-primary)',
            outlineOffset: 2,
          },
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            flexShrink: 0,
          }}
        >
          <SupportAgentIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {LoginConstants.SUPPORT_TITLE}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'var(--color-text-secondary)', display: 'block', lineHeight: 1.3 }}
          >
            {LoginConstants.SUPPORT_SUBTITLE}
          </Typography>
        </Box>
        <ChevronRightIcon sx={{ color: 'var(--color-text-muted)', fontSize: 20 }} />
      </Paper>
    </Box>
  );
}
