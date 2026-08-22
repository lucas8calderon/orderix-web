import React, { useContext } from "react";
import { Card, CardContent, Typography, Box, Chip, Tooltip } from "@mui/material";
import { Users2, Edit, Trash2, QrCode } from "lucide-react";
import Button from '../../menu/components/ui/Button';
import { TablesContext } from "../../tables/provider/TablesContext";

export function CardTable({ table, onShowQRCode, canManage = true }) {

  const { setOpenDeleteDialogTable, setSelectedTable } = useContext(TablesContext);

  return (
    <Card
      sx={{
        cursor: "pointer",
        display: "flex",
        borderRadius: 4,
        width: "100%",
        maxWidth: { sm: 238 },
        minHeight: 187,
        backgroundColor: "#0000",
        boxShadow: 3,
        transition: "transform 0.3s",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: 8,
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          padding: 0,
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "start",
            fontWeight: "bold",
            mt: 3,
            px: 1,
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          Mesa {table.number ?? "Sem número"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 4,
          }}
        >
          {table.capacity >= 1 && (
            <Users2 size={16} fill="none" color="#747474"></Users2>
          )}
          <Typography sx={{ fontSize: 14 }} ml={1} color={"#747474"}>
            {table.capacity >= 1
              ? `${table.capacity} pessoa${table.capacity > 1 ? "s" : ""}`
              : "Em manutenção"}
          </Typography>
        </Box>

        <Chip
          label={table.isAvailable ? "Disponível" : "Indisponível"}
          sx={{
            fontSize: 10,
            height: 22,
            mx: 3,
            mt: 1,
            padding: "0 8px",
            backgroundColor: table.isAvailable ? "green" : "red",
            color: "#fff",
            flexShrink: 0,
          }}
        />
        {canManage && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mt: 1
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            size="sm"
            variant="default"
            onClick={() => onShowQRCode && onShowQRCode(table)}
          >
            <Tooltip title="Ver QR Code">
              <QrCode className="h-4 w-4" size={26} />
            </Tooltip>
          </Button>

          <Button size="sm" variant="default">
            <Tooltip title="Editar">
              <Edit className="h-4 w-4" size={46} />
            </Tooltip>
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={() => {
              setSelectedTable(table);
              setOpenDeleteDialogTable(true);
            }}
          >
            <Tooltip title="Excluir">
              <Trash2 className="h-4 w-4" size={26} />
            </Tooltip>
          </Button>
        </Box>
        )}
      </CardContent>
    </Card>
  );
}
