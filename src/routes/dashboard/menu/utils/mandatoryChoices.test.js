import {
  chargeableUnit,
  choiceHint,
  groupSatisfied,
  mandatoryReady,
  toggleChoice,
} from './mandatoryChoices';

const broto = {
  id: 1,
  value: 27,
  mandatoryGroups: [{
    id: 9,
    name: 'Sabores',
    minSelections: 1,
    maxSelections: 2,
    priceMode: 'HIGHEST',
    items: [
      { id: 1, name: 'Calabresa', price: 27 },
      { id: 2, name: 'Atum', price: 30 },
    ],
  }],
};

describe('mandatoryChoices', () => {
  it('mostra o intervalo e o contador obrigatório', () => {
    expect(choiceHint(broto.mandatoryGroups[0])).toBe('Escolha de 1 a 2 opções');
    expect(groupSatisfied(broto.mandatoryGroups[0], {})).toBe(false);
    expect(groupSatisfied(broto.mandatoryGroups[0], { 9: ['1'] })).toBe(true);
  });

  it('exige os dois sabores antes de liberar a pizza de dois sabores', () => {
    const twoFlavors = {
      id: 4,
      name: 'Sabores',
      minSelections: 2,
      maxSelections: 2,
      priceMode: 'HIGHEST',
      items: [
        { id: 1, name: 'Calabresa', price: 40 },
        { id: 2, name: 'Mussarela', price: 36 },
      ],
    };
    expect(choiceHint(twoFlavors)).toBe('Escolha 2 opções');
    expect(groupSatisfied(twoFlavors, {})).toBe(false);
    expect(groupSatisfied(twoFlavors, { 4: ['1'] })).toBe(false);
    expect(groupSatisfied(twoFlavors, { 4: ['1', '2'] })).toBe(true);
  });

  it('só libera o seletor quando uma opção está escolhida', () => {
    const doneness = {
      id: 7,
      name: 'Ponto da carne',
      minSelections: 1,
      maxSelections: 1,
      priceMode: 'SUM',
      items: [
        { id: 1, name: 'Ao ponto', price: 0 },
        { id: 2, name: 'Mal passada', price: 0 },
        { id: 3, name: 'Bem passada', price: 2 },
      ],
    };
    const burger = { id: 11, value: 28, mandatoryGroups: [doneness] };

    expect(choiceHint(doneness)).toBe('Escolha 1 opção');
    expect(groupSatisfied(doneness, {})).toBe(false);
    expect(mandatoryReady(burger, {})).toBe(false);
    expect(groupSatisfied(doneness, { 7: ['1', '2'] })).toBe(false);
    expect(groupSatisfied(doneness, { 7: ['1'] })).toBe(true);
    expect(mandatoryReady(burger, { 7: ['1'] })).toBe(true);
    expect(toggleChoice(doneness, { 7: ['1'] }, 2)).toEqual(['2']);
    expect(chargeableUnit(28, burger, { 7: ['1'] })).toBe(28);
    expect(chargeableUnit(28, burger, { 7: ['3'] })).toBe(30);
  });

  it('cobra o sabor mais caro e limita a duas opções', () => {
    const first = toggleChoice(broto.mandatoryGroups[0], {}, 1);
    const both = toggleChoice(broto.mandatoryGroups[0], { 9: first }, 2);
    const blocked = toggleChoice(broto.mandatoryGroups[0], { 9: both }, 3);
    expect(both).toEqual(['1', '2']);
    expect(blocked).toEqual(['1', '2']);
    expect(chargeableUnit(27, broto, { 9: both })).toBe(30);
  });
});
