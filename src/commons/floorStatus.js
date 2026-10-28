export function tableFloorStatus(table) {
  const capacity = Number(table?.capacity);
  const inUse = table?.isAvailable === false;
  const maintenance = !(capacity >= 1);
  if (maintenance) {
    return {
      label: 'Em manutenção',
      tone: 'warning',
      detail: 'Fora de operação',
      canDelete: !inUse,
      primaryLabel: 'Ver conta',
      placeOrder: false,
    };
  }
  const people = `${capacity} ${capacity > 1 ? 'pessoas' : 'pessoa'}`;
  if (inUse) {
    return {
      label: 'Em uso',
      tone: 'info',
      detail: people,
      canDelete: false,
      primaryLabel: 'Ver conta',
      placeOrder: false,
    };
  }
  return {
    label: 'Disponível',
    tone: 'success',
    detail: people,
    canDelete: true,
    primaryLabel: 'Lançar',
    placeOrder: true,
  };
}

export function comandaFloorStatus(comanda) {
  const inUse = comanda?.isAvailable === false;
  if (inUse) {
    return {
      label: 'Em uso',
      tone: 'info',
      detail: 'Atendimento avulso',
      canDelete: false,
      primaryLabel: 'Ver conta',
      placeOrder: false,
    };
  }
  return {
    label: 'Disponível',
    tone: 'success',
    detail: 'Atendimento avulso',
    canDelete: true,
    primaryLabel: 'Lançar',
    placeOrder: true,
  };
}
