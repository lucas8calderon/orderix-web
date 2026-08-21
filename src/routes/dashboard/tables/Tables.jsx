import * as React from "react";
import { useContext, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Grid, ListItemButton, Button, Box } from "@mui/material";
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

export function Tables() {
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
  console.log("Tables data:", tables);
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
  };

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

      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "stretch", sm: "flex-end" },
        }}
      >
        <Button
          sx={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-white)",
            width: { xs: "100%", sm: "auto" },
            minHeight: 44,
            ":hover": {
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-black)",
            },
          }}
          startIcon={<AddIcon />}
          onClick={() => setHandleAddNewTable(true)}
          size="large"
        >
          Nova mesa
        </Button>
      </Box>
      <Grid container spacing={2} sx={{ marginTop: 4, marginBottom: 4 }}>
        {tables
          .filter((table) => table.number !== 999)
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
                <CardTable table={table} onShowQRCode={handleShowQRCode} />
              </ListItemButton>
            </Grid>
          ))}
      </Grid>
    </>
  );
}
