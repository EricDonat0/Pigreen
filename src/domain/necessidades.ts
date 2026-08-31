import type { ChaveTraducao } from '../i18n';
import type { Necessidades } from '../types';

export type ChaveNecessidade = keyof Necessidades;

export interface DescricaoNecessidade {
  chave: ChaveNecessidade;
  icone: 'heart' | 'silverware-fork-knife' | 'emoticon-happy-outline';
  /** Rótulo da barra. "Fome" cheia significa "sem fome". */
  chaveRotulo: ChaveTraducao;
  /** Explicação lúdica exibida no card de ajuda. */
  chaveExplicacao: ChaveTraducao;
}

/**
 * Metadados das três barras de status. Ficam no domínio, e não dentro do
 * componente, porque a aba do responsável mostra as mesmas explicações — e os
 * textos em si vivem nos dicionários de idioma, não aqui.
 */
export const NECESSIDADES: readonly DescricaoNecessidade[] = [
  {
    chave: 'saude',
    icone: 'heart',
    chaveRotulo: 'necessidade.saude',
    chaveExplicacao: 'necessidade.saude.explicacao',
  },
  {
    chave: 'saciedade',
    icone: 'silverware-fork-knife',
    chaveRotulo: 'necessidade.saciedade',
    chaveExplicacao: 'necessidade.saciedade.explicacao',
  },
  {
    chave: 'felicidade',
    icone: 'emoticon-happy-outline',
    chaveRotulo: 'necessidade.felicidade',
    chaveExplicacao: 'necessidade.felicidade.explicacao',
  },
] as const;
