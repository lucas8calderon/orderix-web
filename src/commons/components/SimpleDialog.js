import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { BasicSelect } from './Select';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export function CustomizedDialog({ open, onClose, onSave }) {
    const [number, setTableNumber] = React.useState('');
    const [isAvailable, setIsAvailable] = React.useState(false);

   /*  TODO Clean fields after Savings;
    Show success or error Message; */

    const handleTableNumberChange = (event) => {
        setTableNumber(event.target.value);
    };

    const handleSelectedOption = (isAvailable) => {
        setIsAvailable(isAvailable == 1);
    }

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={onClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth
                maxWidth="sm"
                scroll="paper"
                PaperProps={{
                    sx: {
                        m: { xs: 2, sm: 4 },
                        width: { xs: 'calc(100% - 32px)', sm: 'auto' },
                        maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' },
                    },
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Adicionar nova mesa
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <FormControl>
                        <InputLabel htmlFor="component-outlined">Número da mesa</InputLabel>
                        <OutlinedInput
                            id="component-outlined"
                            defaultValue="Composed TextField"
                            type="number"
                            label="Número da mesa"
                            onChange={handleTableNumberChange}
                            sx={{ marginBottom: 3 }}
                        />
                        <BasicSelect onSelected={(isAvailable) => handleSelectedOption(isAvailable)} />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={(e) => onSave({ number, isAvailable })}>
                        Salvar
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}