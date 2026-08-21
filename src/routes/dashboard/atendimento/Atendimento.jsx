import * as React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import TableBarIcon from "@mui/icons-material/TableBar";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Tables } from "../tables/Tables";
import { Comandas } from "../comandas/Comandas";

export function Atendimento() {
  const [tab, setTab] = React.useState(0);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: 2,
          minHeight: 48,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            minHeight: 48,
            minWidth: 'auto',
            px: { xs: 1.5, sm: 2 },
          },
          "& .Mui-selected": {
            color: "var(--color-primary) !important",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "var(--color-primary)",
          },
        }}
      >
        <Tab icon={<TableBarIcon />} iconPosition="start" label="Mesas" />
        <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="Comandas" />
      </Tabs>

      {tab === 0 && <Tables />}
      {tab === 1 && <Comandas />}
    </Box>
  );
}
