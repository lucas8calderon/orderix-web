import * as React from "react";
import { useContext, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Grid, ListItemButton, Button, Box, Typography } from "@mui/material";
import { Loading } from "../../../commons/components/Loading";
import { CardTable } from "../menu/utils/CardTable";
import { TablesContext } from "./provider/TablesContext";
import { useGetTables } from "./hook/useGetTables";
import { usePostTables } from "./hook/usePostTables";
import { useDeleteTable } from "./hook/useDeleteTables";
import ErrorDeleteDialog from "../menu/components/ErrorDeleteDialog";
import { ConfirmDeleteDialog } from "../menu/components/ConfirmDeleteDialog";
import { TableFormDialog } from "../menu/components/TableFormDialog";
import { TableQRCodeDialog } from "../menu/components/TableQRCodeDialog";
import { getCurrentUser } from "../../../services/session";
import { canManageFloor } from "../../../services/accessControl";

export function Tables({ onOpenAccount, floorVersion = 0 }) {
  const {
    showTables,
    setShowTables,
    blockTablesFields,
    setBlockTablesFields,
    onAddTableResult,
    setOnAddTableResult,
    handleSuccess,
    handleError,
    handleAddNewTable,
    setHandleAddNewTable,
    selectedTable,
    setSelectedTable,
    handleDeleteTable,
    setHandleDeleteTable,
    openDeleteDialogTable,
    setOpenDeleteDialogTable,
  } = useContext(TablesContext);

  const { tables, loading, error, emptyResult, fetchTable } = useGetTables();
  const canManage = canManageFloor(getCurrentUser());
  const {
    successSavingTable,
    errorSavingTable,
    postTable,
    newTableLoading,
    setSuccessSavingTable,
  } = usePostTables();
  const {
    loadingToDelete,
    errorToDelete,
    successToDelete,
    deleteTableById,
    resetDeleteState,
  } = useDeleteTable();

  const handleOnClose = () => {
    setOnAddTableResult({});
    setOpenAddTable(false);
    setHandleAddNewTable(false);
  };

  const onHandleSaveTable = (table) => {
    postTable(table);
    setSelectedTable({});
    setSuccessSavingTable(false);
  };

  const handleSelectedTable = (table) => {
    setSelectedTable(table);
    onOpenAccount?.({ kind: "table", id: table.id, number: table.number });
  };

  useEffect(() => {
    if (floorVersion > 0) {
      fetchTable();
    }
  }, [floorVersion, fetchTable]);

  const [openAddTable, setOpenAddTable] = useState(false);
  const [openQRCodeDialog, setOpenQRCodeDialog] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState(null);

  const handleShowQRCode = (table) => {
    setSelectedTableForQR(table);
    setOpenQRCodeDialog(true);
  };

  const handleCloseQRCode = () => {
    setOpenQRCodeDialog(false);
    setSelectedTableForQR(null);
  };

  useEffect(() => {
    if (Object.keys(handleDeleteTable).length !== 0) {
      deleteTableById(handleDeleteTable.id);
      setHandleDeleteTable({}); 
    }
  }, [handleDeleteTable]);

  const confirmDelete = () => {
    setHandleDeleteTable(selectedTable);
  };

  useEffect(() => {
    if (successToDelete || successSavingTable) {
      fetchTable();
      setSelectedTable({});
      resetDeleteState();
      setOpenDeleteDialogTable(false);
    }
  }, [successToDelete, successSavingTable]);

  useEffect(() => {
    if (handleAddNewTable === true) {
      setOnAddTableResult({});
      setBlockTablesFields(false);
      setOpenAddTable(true);
    }
  }, [handleAddNewTable]);

  useEffect(() => {
    if (error) {
      setOnAddTableResult(handleError);
    }
  }, [error]);
  
  useEffect(() => {
    if (error) {
      setOnAddTableResult(handleError);
    }
  }, [errorSavingTable]);

  useEffect(() => {
    if (successSavingTable) {
      setOnAddTableResult(handleSuccess);
      fetchTable();
    }
  }, [successSavingTable]);

  return (
    <>
      {loading && !loadingToDelete && (
        <Loading loadingMessage={"Carregando mesas..."} />
      )}
      {loadingToDelete && !loading && (
        <Loading loadingMessage={"Excluíndo mesa..."} />
      )}

      {errorToDelete && (
        <ErrorDeleteDialog
          open={errorToDelete}
          onClose={resetDeleteState}
          itemName={selectedTable.name}
        />
      )}

      <ConfirmDeleteDialog
        open={openDeleteDialogTable}
        onClose={() => setOpenDeleteDialogTable(false)}
        onConfirm={confirmDelete}
        itemType={"table"}
        itemName={selectedTable?.name}
      />

      <TableFormDialog
        open={openAddTable}
        onClose={handleOnClose}
        disableEditCategory={true}
        onSaveTable={onHandleSaveTable}
      />

      <TableQRCodeDialog
        open={openQRCodeDialog}
        onClose={handleCloseQRCode}
        table={selectedTableForQR}
      />

      <Box className="atendimento-section-header">
        <Typography variant="h5" className="atendimento-section-title">
          Mesas
        </Typography>
        {canManage && (
        <Button
          startIcon={<AddIcon />}
          onClick={() => setHandleAddNewTable(true)}
          sx={{
            backgroundColor: "transparent !important",
            color: "var(--color-primary) !important",
            border: "1px solid var(--color-primary) !important",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "var(--color-primary) !important",
              color: "#fff !important",
            },
          }}
        >
          Criar mesa
        </Button>
        )}
      </Box>
      {!loading && tables.filter((table) => table.number !== 999).length === 0 && (
        <Typography className="atendimento-empty" sx={{ color: "text.secondary" }}>
          Nenhuma mesa cadastrada ainda.
        </Typography>
      )}
      <Grid container spacing={2}>
        {tables
          .filter((table) => table.number !== 999)
          .slice()
          .sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0))
          .map((table) => (
            <Grid item key={table.id} xs={12} sm={6} md={4} lg={3} xl={2}>
              <ListItemButton
                sx={{
                  boxShadow: "none",
                  width: "100%",
                  p: { xs: 0, sm: 1 },
                  "&:hover": {
                    boxShadow: "none",
                    backgroundColor: "transparent",
                  },
                }}
                onClick={() => handleSelectedTable(table)}
              >
                <CardTable table={table} onShowQRCode={handleShowQRCode} canManage={canManage} />
              </ListItemButton>
            </Grid>
          ))}
      </Grid>
    </>
  );
}
