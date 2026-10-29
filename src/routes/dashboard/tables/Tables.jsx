import { EmptyState } from '../../../commons/components/EmptyState';
import { FloorFilterBar, filterFloorItems } from '../../../commons/components/FloorFilterBar';
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Grid, Button, Box, Typography } from "@mui/material";
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

export function Tables({ onOpenAccount, onPlaceOrder, floorVersion = 0 }) {
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
    errorMessage,
    postTable,
    newTableLoading,
    setSuccessSavingTable,
  } = usePostTables();
  const {
    loadingToDelete,
    errorToDelete,
    errorMessage: deleteErrorMessage,
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
      fetchTable({ silent: true });
    }
  }, [floorVersion, fetchTable]);

  const [openAddTable, setOpenAddTable] = useState(false);
  const [floorFilter, setFloorFilter] = useState('all');
  const [floorQuery, setFloorQuery] = useState('');
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
    if (errorSavingTable) {
      setOnAddTableResult({
        ...handleError,
        message: errorMessage || 'Já existe uma mesa com este número',
      });
    }
  }, [errorSavingTable, errorMessage]);

  useEffect(() => {
    if (successSavingTable) {
      setOnAddTableResult(handleSuccess);
      fetchTable();
    }
  }, [successSavingTable]);

  const floorTables = tables
    .filter((table) => table.number !== 999)
    .slice()
    .sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0));
  const visibleTables = filterFloorItems(floorTables, { status: floorFilter, query: floorQuery });

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
          itemName={selectedTable?.number != null ? `Mesa ${selectedTable.number}` : 'a mesa'}
          detail={deleteErrorMessage}
        />
      )}

      <ConfirmDeleteDialog
        open={openDeleteDialogTable}
        onClose={() => setOpenDeleteDialogTable(false)}
        onConfirm={confirmDelete}
        itemType={"table"}
        itemName={selectedTable?.number != null ? `Mesa ${selectedTable.number}` : 'esta mesa'}
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
        <Typography variant="h5" component="h2" className="atendimento-section-title">
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
      {!loading && floorTables.length === 0 && (
        <EmptyState title="Nenhuma mesa cadastrada" description={canManage ? 'Cadastre as mesas do salão para organizar o atendimento.' : 'Peça ao administrador para cadastrar as mesas do salão.'} actionLabel={canManage ? 'Cadastrar mesa' : undefined} onAction={() => setHandleAddNewTable(true)} />
      )}
      {floorTables.length > 0 ? (
        <FloorFilterBar
          items={floorTables}
          status={floorFilter}
          onStatus={setFloorFilter}
          query={floorQuery}
          onQuery={setFloorQuery}
          searchLabel="Buscar mesa pelo número"
        />
      ) : null}
      {floorTables.length > 0 && visibleTables.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>Nenhuma mesa neste filtro.</Typography>
      ) : null}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {visibleTables
          .map((table) => (
            <Grid item key={table.id} xs={6} sm={4} md={3} lg={3} xl={2}>
              <CardTable table={table} onShowQRCode={handleShowQRCode} onOpen={() => handleSelectedTable(table)} onPlace={() => onPlaceOrder?.({ kind: 'table', id: table.id, number: table.number })} canManage={canManage} />
            </Grid>
          ))}
      </Grid>
    </>
  );
}
