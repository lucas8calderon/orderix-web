import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Grid, ListItemButton, Button, Box, Typography } from '@mui/material';
import { Loading } from '../../../commons/components/Loading';
import { CardComanda } from './components/CardComanda';
import { ComandasContext } from './provider/ComandasContext';
import { useGetComandas } from './hook/useGetComandas';
import { usePostComandas } from './hook/usePostComandas';
import { useDeleteComanda } from './hook/useDeleteComandas';
import ErrorDeleteDialog from '../menu/components/ErrorDeleteDialog';
import { ConfirmDeleteDialog } from '../menu/components/ConfirmDeleteDialog';
import { ComandaFormDialog } from './components/ComandaFormDialog';

export function Comandas() {
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
  };

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

      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
        }}
      >
        <Button
          sx={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-white)',
            width: { xs: '100%', sm: 'auto' },
            minHeight: 44,
            ':hover': {
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-black)',
            },
          }}
          startIcon={<AddIcon />}
          onClick={() => setHandleAddNewComanda(true)}
          size="large"
        >
          Nova comanda
        </Button>
      </Box>

      {emptyResult && !loading && (
        <Typography sx={{ mt: 4, color: 'text.secondary' }} align="center">
          Nenhuma comanda cadastrada ainda.
        </Typography>
      )}

      <Grid container spacing={2} sx={{ marginTop: 4, marginBottom: 4 }}>
        {comandas.map((comanda) => (
          <Grid item key={comanda.id} xs={12} sm={6} md={4} lg={3} xl={2}>
            <ListItemButton
              sx={{
                boxShadow: 'none',
                width: '100%',
                p: { xs: 0, sm: 1 },
                '&:hover': {
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                },
              }}
              onClick={() => handleSelectedComanda(comanda)}
            >
              <CardComanda comanda={comanda} />
            </ListItemButton>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
