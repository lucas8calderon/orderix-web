// A capacidade é só informativa: mesa sem capacidade funciona normalmente.
export function tableFloorStatus(table) {
  const capacity = Number(table?.capacity);
  const inUse = table?.isAvailable === false;
  const people = capacity >= 1
    ? `${capacity} ${capacity > 1 ? 'pessoas' : 'pessoa'}`
    : 'Capacidade não informada';
  if (inUse) {
    return {
      label: 'Em uso',
      tone: 'info',
      detail: people,
      canDelete: false,
      primaryLabel: 'Cobrar',
      secondaryLabel: 'Lançar mais',
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
      primaryLabel: 'Cobrar',
      secondaryLabel: 'Lançar mais',
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
