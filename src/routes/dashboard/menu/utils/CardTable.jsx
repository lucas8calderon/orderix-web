import { useContext } from 'react';
import { TablesContext } from '../../tables/provider/TablesContext';
import { FloorCard } from '../../../../commons/components/FloorCard';
import { tableFloorStatus } from '../../../../commons/floorStatus';

export function CardTable({ table, onOpen, onPlace, onShowQRCode, canManage = true }) {
  const { setOpenDeleteDialogTable, setSelectedTable } = useContext(TablesContext);
  const status = tableFloorStatus(table);
  return (
    <FloorCard
      title={'Mesa ' + (table.number ?? 'Sem número')}
      detail={status.detail}
      statusLabel={status.label}
      statusTone={status.tone}
      primaryLabel={status.primaryLabel}
      secondaryLabel={status.secondaryLabel}
      onPrimary={status.placeOrder ? onPlace : onOpen}
      canDelete={status.canDelete}
      canManage={canManage}
      onOpen={onOpen}
      onPlace={onPlace}
      onQr={() => onShowQRCode?.(table)}
      onDelete={() => { setSelectedTable(table); setOpenDeleteDialogTable(true); }}
    />
  );
}
