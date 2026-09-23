import { Tabs, Tab } from '@mui/material';

export function PageTabs({ id, value, onChange, tabs, label }) {
  return <Tabs value={value} onChange={(_, next) => onChange(next)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label={label} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider', minHeight: 44 }}>
    {tabs.map(tab => <Tab key={tab.value} value={tab.value} id={id + '-tab-' + tab.value} aria-controls={id + '-panel-' + tab.value} label={tab.label} sx={{ textTransform: 'none', minHeight: 44, px: 2, fontWeight: 600 }} />)}
  </Tabs>;
}
