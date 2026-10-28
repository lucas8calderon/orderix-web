import { useContext, useState } from 'react';
import { ComandasContext } from '../provider/ComandasContext';
import { ComandaQRCodeDialog } from './ComandaQRCodeDialog';
import { FloorCard } from '../../../../commons/components/FloorCard';
import { comandaFloorStatus } from '../../../../commons/floorStatus';

export function CardComanda({ comanda, onOpen, onPlace, canManage = true }) {
  const { setOpenDeleteDialogComanda, setSelectedComanda } = useContext(ComandasContext);
  const [qrOpen, setQrOpen] = useState(false);
  const status = comandaFloorStatus(comanda);
  return <>
    <FloorCard
      title={'Comanda ' + (comanda.number ?? 'Sem número')}
      detail={status.detail}
      statusLabel={status.label}
      statusTone={status.tone}
      primaryLabel={status.primaryLabel}
      onPrimary={status.placeOrder ? onPlace : onOpen}
      canDelete={status.canDelete}
      canManage={canManage}
      onOpen={onOpen}
      onPlace={onPlace}
      onQr={() => setQrOpen(true)}
      onDelete={() => { setSelectedComanda(comanda); setOpenDeleteDialogComanda(true); }}
    />
    <ComandaQRCodeDialog open={qrOpen} onClose={() => setQrOpen(false)} comanda={comanda} />
  </>;
}
