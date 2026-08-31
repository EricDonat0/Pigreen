import type { ChaveTraducao } from '../i18n';
import type { Alimento } from '../types';

/**
 * Catálogo de alimentos do Pigreen.
 *
 * Todos são de origem vegetal — é a premissa pedagógica do app. O catálogo
 * guarda apenas o que é *regra de jogo*: efeito, XP e nível de desbloqueio. Os
 * nomes e as descrições ficam nos dicionários de idioma, indexados pelo id.
 *
 * O balanceamento segue três regras:
 *  1. nenhum alimento sozinho enche a barra de saciedade (incentiva variedade);
 *  2. leguminosas e tubérculos saciam mais, folhas e legumes saciam menos mas
 *     dão mais saúde;
 *  3. o XP é proporcional ao esforço de desbloqueio, não ao efeito imediato.
 */
export const ALIMENTOS: readonly Alimento[] = [
  { id: 'arroz', efeito: { saciedade: 22, saude: 4, felicidade: 3 }, xp: 10, nivelMinimo: 1 },
  { id: 'feijao', efeito: { saciedade: 24, saude: 8, felicidade: 4 }, xp: 12, nivelMinimo: 1 },
  {
    id: 'pure_de_batata',
    efeito: { saciedade: 26, saude: 5, felicidade: 8 },
    xp: 12,
    nivelMinimo: 1,
  },
  { id: 'abobora', efeito: { saciedade: 18, saude: 12, felicidade: 5 }, xp: 14, nivelMinimo: 1 },
  { id: 'batata', efeito: { saciedade: 20, saude: 6, felicidade: 4 }, xp: 10, nivelMinimo: 1 },
  { id: 'inhame', efeito: { saciedade: 21, saude: 10, felicidade: 3 }, xp: 14, nivelMinimo: 2 },
  { id: 'pepino', efeito: { saciedade: 8, saude: 12, felicidade: 6 }, xp: 12, nivelMinimo: 2 },
  { id: 'alface', efeito: { saciedade: 6, saude: 14, felicidade: 5 }, xp: 12, nivelMinimo: 2 },
  {
    id: 'bolinho_de_soja',
    efeito: { saciedade: 30, saude: 10, felicidade: 20 },
    xp: 25,
    nivelMinimo: 2,
  },
  { id: 'chuchu', efeito: { saciedade: 12, saude: 11, felicidade: 3 }, xp: 12, nivelMinimo: 3 },
] as const;

const POR_ID = new Map(ALIMENTOS.map((a) => [a.id, a]));

/** Alimentos liberados desde o nível 1, sem necessidade de missão. */
export const ALIMENTOS_INICIAIS = ALIMENTOS.filter((a) => a.nivelMinimo === 1).map((a) => a.id);

export function buscarAlimento(id: string): Alimento | undefined {
  return POR_ID.get(id);
}

/** Chaves de tradução do alimento. Tipadas por construção. */
export function chavesDoAlimento(id: string): { nome: ChaveTraducao; descricao: ChaveTraducao } {
  return {
    nome: `alimento.${id}.nome` as ChaveTraducao,
    descricao: `alimento.${id}.descricao` as ChaveTraducao,
  };
}

/**
 * Alimentos que o carrossel deve mostrar: os do nível alcançado mais os
 * desbloqueados por missão. A ordem do catálogo é preservada para que a
 * posição de um item não mude a cada nível — crianças memorizam posição.
 */
export function alimentosDisponiveis(
  nivel: number,
  desbloqueados: readonly string[] = [],
): Alimento[] {
  const extras = new Set(desbloqueados);
  return ALIMENTOS.filter((a) => a.nivelMinimo <= nivel || extras.has(a.id));
}

/** Alimentos ainda trancados, exibidos com cadeado para dar meta à criança. */
export function alimentosBloqueados(
  nivel: number,
  desbloqueados: readonly string[] = [],
): Alimento[] {
  const extras = new Set(desbloqueados);
  return ALIMENTOS.filter((a) => a.nivelMinimo > nivel && !extras.has(a.id));
}
