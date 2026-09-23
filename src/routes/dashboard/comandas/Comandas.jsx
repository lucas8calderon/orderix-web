import { EmptyState } from '../../../commons/components/EmptyState';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Grid, Button, Box, Typography } from '@mui/material';
import { Loading } from '../../../commons/components/Loading';
import { CardComanda } from './components/CardComanda';
import { ComandasContext } from './provider/ComandasContext';
import { useGetComandas } from './hook/useGetComandas';
import { usePostComandas } from './hook/usePostComandas';
import { useDeleteComanda } from './hook/useDeleteComandas';
import ErrorDeleteDialog from '../menu/components/ErrorDeleteDialog';
import { ConfirmDeleteDialog } from '../menu/components/ConfirmDeleteDialog';
import { ComandaFormDialog } from './components/ComandaFormDialog';
import { getCurrentUser } from '../../../services/session';
import { canManageFloor } from '../../../services/accessControl';

export function Comandas({ onOpenAccount, floorVersion = 0 }) {
  const {
    setBlockComandaFields,
    setOnAddComandaResult,
    handleSuccess,
    handleError,
    handleAddNewComanda,
    setHandleAddNewComanda,
    selectedComanda,
    setSelectedComanda,
    handleDeleteComanda,
    setHandleDeleteComanda,
    openDeleteDialogComanda,
    setOpenDeleteDialogComanda,
  } = useContext(ComandasContext);

  const { comandas, loading, error, emptyResult, fetchComandas } = useGetComandas();
  const canManage = canManageFloor(getCurrentUser());
  const {
    successSavingComanda,
    errorSavingComanda,
    errorMessage,
    postComanda,
    setSuccessSavingComanda,
  } = usePostComandas();
  const {
    loadingToDelete,
    errorToDelete,
    errorMessage: deleteErrorMessage,
    successToDelete,
    deleteComandaById,
    resetDeleteState,
  } = useDeleteComanda();

  const [openAddComanda, setOpenAddComanda] = useState(false);

  const handleOnClose = () => {
    setOnAddComandaResult({});
    setOpenAddComanda(false);
    setHandleAddNewComanda(false);
  };

  const onHandleSaveComanda = (comanda) => {
    postComanda(comanda);
    setSelectedComanda({});
    setSuccessSavingComanda(false);
  };

  const handleSelectedComanda = (comanda) => {
    setSelectedComanda(comanda);
    onOpenAccount?.({ kind: 'comanda', id: comanda.id, number: comanda.number });
  };

  useEffect(() => {
    if (floorVersion > 0) {
      fetchComandas({ silent: true });
    }
  }, [floorVersion, fetchComandas]);

  useEffect(() => {
    if (Object.keys(handleDeleteComanda).length !== 0) {
      deleteComandaById(handleDeleteComanda.id);
      setHandleDeleteComanda({});
    }
  }, [handleDeleteComanda]);

  const confirmDelete = () => {
    setHandleDeleteComanda(selectedComanda);
  };

  useEffect(() => {
    if (successToDelete || successSavingComanda) {
      fetchComandas();
      setSelectedComanda({});
      resetDeleteState();
      setOpenDeleteDialogComanda(false);
    }
  }, [successToDelete, successSavingComanda]);

  useEffect(() => {
    if (handleAddNewComanda === true) {
      setOnAddComandaResult({});
      setBlockComandaFields(false);
      setOpenAddComanda(true);
    }
  }, [handleAddNewComanda]);

  useEffect(() => {
    if (error) {
      setOnAddComandaResult(handleError);
    }
  }, [error]);

  useEffect(() => {
    if (errorSavingComanda) {
      setOnAddComandaResult({
        ...handleError,
        message: errorMessage || handleError.message,
      });
    }
  }, [errorSavingComanda, errorMessage]);

  useEffect(() => {
    if (successSavingComanda) {
      setOnAddComandaResult(handleSuccess);
      fetchComandas();
    }
  }, [successSavingComanda]);

  return (
    <>
      {loading && !loadingToDelete && (
        <Loading loadingMessage="Carregando comandas..." />
      )}
      {loadingToDelete && !loading && (
        <Loading loadingMessage="Excluindo comanda..." />
      )}

      {errorToDelete && (
        <ErrorDeleteDialog
          open={errorToDelete}
          onClose={resetDeleteState}
          itemName={selectedComanda?.number ? `Comanda ${selectedComanda.number}` : 'Comanda'}
          detail={deleteErrorMessage}
        />
      )}

      <ConfirmDeleteDialog
        open={openDeleteDialogComanda}
        onClose={() => setOpenDeleteDialogComanda(false)}
        onConfirm={confirmDelete}
        itemType="comanda"
        itemName={
          selectedComanda?.number != null
            ? `Comanda ${selectedComanda.number}`
            : 'esta comanda'
        }
      />

      <ComandaFormDialog
        open={openAddComanda}
        onClose={handleOnClose}
        onSaveComanda={onHandleSaveComanda}
      />

      <Box className="atendimento-section-header">
        <Typography variant="h5" component="h2" className="atendimento-section-title">
          Comandas
        </Typography>
        {canManage && (
        <Button
          startIcon={<AddIcon />}
          onClick={() => setHandleAddNewComanda(true)}
          sx={{
            backgroundColor: 'transparent !important',
            color: 'var(--color-primary) !important',
            border: '1px solid var(--color-primary) !important',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'var(--color-primary) !important',
              color: '#fff !important',
            },
          }}
        >
          Nova comanda
        </Button>
        )}
      </Box>

      {emptyResult && !loading && (
        <EmptyState title="Nenhuma comanda cadastrada" description={canManage ? 'Cadastre as comandas para organizar o atendimento.' : 'Peça ao administrador para cadastrar as comandas.'} actionLabel={canManage ? 'Cadastrar comanda' : undefined} onAction={() => setHandleAddNewComanda(true)} />
      )}

      <Grid container spacing={2}>
        {comandas.map((comanda) => (
          <Grid item key={comanda.id} xs={12} sm={6} md={4} lg={3} xl={2}>
            <CardComanda comanda={comanda} onOpen={() => handleSelectedComanda(comanda)} canManage={canManage} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
