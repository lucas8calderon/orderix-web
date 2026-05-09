import { Button, Typography } from "@mui/material";

export function GenericError({ onTryAgain }) {
    return (
        <>
            <Typography variant="h6" sx={{ marginTop: 6, marginLeft: 2 }}>Erro ao carregar categorias</Typography>
            <Button sx={{ marginTop: 3, marginLeft: 2 }} onClick={() => onTryAgain()} variant="contained">Tentar novamente</Button>
        </>
    )
}