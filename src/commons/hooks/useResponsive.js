import useMediaQuery from '@mui/material/useMediaQuery';

export const BREAKPOINTS = {
  xs: 480,
  sm: 600,
  md: 900,
  lg: 1200,
};

export function useIsMobile() {
  return useMediaQuery(`(max-width:${BREAKPOINTS.sm}px)`);
}

export function useIsTabletDown() {
  return useMediaQuery(`(max-width:${BREAKPOINTS.md}px)`);
}

export function useDialogResponsiveProps({ fullScreenOnMobile = true, paperSx = {} } = {}) {
  const isMobile = useIsMobile();

  return {
    fullWidth: true,
    scroll: 'paper',
    fullScreen: Boolean(fullScreenOnMobile && isMobile),
    PaperProps: {
      sx: {
        ...(isMobile && !fullScreenOnMobile
          ? {
              m: 2,
              width: 'calc(100% - 32px)',
              maxWidth: '100%',
              maxHeight: 'calc(100% - 32px)',
            }
          : {}),
        ...(isMobile && fullScreenOnMobile ? { borderRadius: 0 } : {}),
        ...paperSx,
      },
    },
  };
}
