import { useContext, useState } from 'react';
import { ComandasContext } from '../provider/ComandasContext';
import { ComandaQRCodeDialog } from './ComandaQRCodeDialog';
import { FloorCard } from '../../../../commons/components/FloorCard';

export function CardComanda({ comanda, onOpen, onPlace, canManage = true }) {
  const { setOpenDeleteDialogComanda, setSelectedComanda } = useContext(ComandasContext);
  const [qrOpen, setQrOpen] = useState(false);
  return <>
    <FloorCard title={'Comanda ' + (comanda.number ?? 'Sem número')} detail="Atendimento avulso" available={comanda.isAvailable} canManage={canManage} onOpen={onOpen} onPlace={onPlace} onQr={() => setQrOpen(true)} onDelete={() => { setSelectedComanda(comanda); setOpenDeleteDialogComanda(true); }} />
    <ComandaQRCodeDialog open={qrOpen} onClose={() => setQrOpen(false)} comanda={comanda} />
  </>;
}
