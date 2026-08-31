import type { ChaveTraducao } from '../i18n';

/**
 * Acessórios do porquinho.
 *
 * Cada item é desenhado em código sobre o sprite — posição em fração do
 * tamanho do pet, para acompanhar qualquer escala. `emoji` é o desenho
 * provisório até as ilustrações saírem do Figma; trocar por `<Image>` mexe
 * apenas em `AcessorioPet`.
 */
export interface ItemCustomizacao {
  id: string;
  chaveNome: ChaveTraducao;
  nivelMinimo: number;
  emoji: string;
  /** Posição e tamanho relativos à largura do sprite (0 a 1). */
  posicao: { x: number; y: number; escala: number; rotacao?: number };
}

export const ITENS: readonly ItemCustomizacao[] = [
  {
    id: 'laco',
    chaveNome: 'item.laco.nome',
    nivelMinimo: 1,
    emoji: '🎀',
    posicao: { x: 0.22, y: 0.02, escala: 0.26 },
  },
  {
    id: 'bone',
    chaveNome: 'item.bone.nome',
    nivelMinimo: 2,
    emoji: '🧢',
    posicao: { x: 0.36, y: -0.04, escala: 0.34 },
  },
  {
    id: 'oculos',
    chaveNome: 'item.oculos.nome',
    nivelMinimo: 3,
    emoji: '🕶️',
    posicao: { x: 0.33, y: 0.3, escala: 0.32 },
  },
  {
    id: 'cachecol',
    chaveNome: 'item.cachecol.nome',
    nivelMinimo: 4,
    emoji: '🧣',
    posicao: { x: 0.34, y: 0.52, escala: 0.34 },
  },
  {
    id: 'coroa',
    chaveNome: 'item.coroa.nome',
    nivelMinimo: 6,
    emoji: '👑',
    posicao: { x: 0.37, y: -0.06, escala: 0.3 },
  },
] as const;

const POR_ID = new Map(ITENS.map((i) => [i.id, i]));

export function buscarItem(id: string): ItemCustomizacao | undefined {
  return POR_ID.get(id);
}

export function itemLiberado(item: ItemCustomizacao, nivel: number): boolean {
  return item.nivelMinimo <= nivel;
}

/**
 * Um acessório por vez, como no protótipo: vestir um item troca o anterior, e
 * vestir o que já está no pet o remove.
 */
export function alternarItem(equipados: readonly string[], id: string): string[] {
  return equipados.includes(id) ? [] : [id];
}
