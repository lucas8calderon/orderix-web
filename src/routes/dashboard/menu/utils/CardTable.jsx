import { useContext } from 'react';
import { TablesContext } from '../../tables/provider/TablesContext';
import { FloorCard } from '../../../../commons/components/FloorCard';

export function CardTable({ table, onOpen, onShowQRCode, canManage = true }) {
  const { setOpenDeleteDialogTable, setSelectedTable } = useContext(TablesContext);
  return <FloorCard title={'Mesa ' + (table.number ?? 'Sem número')} detail={table.capacity >= 1 ? table.capacity + (table.capacity > 1 ? ' pessoas' : ' pessoa') : 'Em manutenção'} available={table.isAvailable} canManage={canManage} onOpen={onOpen} onQr={() => onShowQRCode?.(table)} onDelete={() => { setSelectedTable(table); setOpenDeleteDialogTable(true); }} />;
}
