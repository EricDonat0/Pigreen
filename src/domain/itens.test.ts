import { describe, expect, it } from 'vitest';
import { ITENS, alternarItem, buscarItem, itemLiberado } from './itens';

describe('catálogo de itens', () => {
  it('não tem ids repetidos', () => {
    const ids = ITENS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('começa com pelo menos um item disponível no nível 1', () => {
    expect(ITENS.some((i) => i.nivelMinimo === 1)).toBe(true);
  });

  it('encontra item por id', () => {
    expect(buscarItem('laco')?.id).toBe('laco');
    expect(buscarItem('inexistente')).toBeUndefined();
  });
});

describe('itemLiberado', () => {
  it('libera no nível exato', () => {
    const bone = buscarItem('bone')!;
    expect(itemLiberado(bone, bone.nivelMinimo - 1)).toBe(false);
    expect(itemLiberado(bone, bone.nivelMinimo)).toBe(true);
  });
});

describe('alternarItem', () => {
  it('veste quando nada está equipado', () => {
    expect(alternarItem([], 'laco')).toEqual(['laco']);
  });

  it('troca o acessório em uso em vez de acumular', () => {
    expect(alternarItem(['laco'], 'bone')).toEqual(['bone']);
  });

  it('tira o acessório quando ele já está vestido', () => {
    expect(alternarItem(['laco'], 'laco')).toEqual([]);
  });
});
