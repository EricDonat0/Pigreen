/**
 * Modelos de domínio do Pigreen.
 *
 * Regra geral: instantes são persistidos como epoch em milissegundos (número),
 * não como `Date` nem `Timestamp` do Firestore. Isso mantém o domínio puro,
 * serializável e independente do backend — as funções de `src/domain` podem ser
 * testadas sem nenhum mock do Firebase.
 *
 * Segunda regra: nada de texto voltado ao usuário mora aqui. Nomes e
 * descrições vivem nos dicionários de `src/i18n`, indexados pelos ids abaixo.
 */

/** Milissegundos desde a época Unix. */
export type Instante = number;

/** Perfil alimentar declarado pelo responsável no cadastro. */
export type PerfilDieta = 'vegano' | 'vegetariano' | 'transicao';

export interface Usuario {
  uid: string;
  nomeResponsavel: string;
  nomeCrianca: string;
  email: string;
  /** Nascimento da criança, em ISO `YYYY-MM-DD`. */
  nascimentoCrianca: string;
  dieta: PerfilDieta;
  criadoEm: Instante;
  /** PIN de 4 dígitos que protege a aba do responsável, guardado como hash. */
  hashPin?: string;
}

/** As três necessidades do pet. Todas variam de 0 a 100, onde 100 é o ideal. */
export interface Necessidades {
  saude: number;
  /**
   * Quanto o pet está *saciado*. A UI rotula essa barra como "Fome" para
   * acompanhar o Figma: cheia significa "sem fome".
   */
  saciedade: number;
  felicidade: number;
}

/** Estado visual do porquinho, derivado das necessidades — nunca persistido. */
export type EstadoPet = 'feliz' | 'normal' | 'faminto' | 'triste' | 'dormindo';

export interface Pet {
  /** Mesmo id do usuário dono: um pet por conta. */
  uid: string;
  nome: string;
  nivel: number;
  /** XP acumulado dentro do nível atual. */
  xp: number;
  necessidades: Necessidades;
  /** Instante em que `necessidades` foi calculado pela última vez. */
  atualizadoEm: Instante;
  /** Enquanto `agora < dormeAte`, o pet está tirando uma soneca digestiva. */
  dormeAte: Instante | null;
  /** Ids de acessórios em uso. */
  itensEquipados: string[];
  /** Ids de alimentos já desbloqueados além dos iniciais. */
  alimentosDesbloqueados: string[];
  criadoEm: Instante;
}

/** Momento do dia em que a refeição foi registrada, espelhando a aba do responsável. */
export type Refeicao =
  | 'cafe_da_manha'
  | 'lanche_da_manha'
  | 'almoco'
  | 'lanche_da_tarde'
  | 'jantar';

export const REFEICOES: readonly Refeicao[] = [
  'cafe_da_manha',
  'lanche_da_manha',
  'almoco',
  'lanche_da_tarde',
  'jantar',
];

export interface Alimento {
  id: string;
  /** Efeito nas necessidades quando o alimento é oferecido. */
  efeito: Partial<Necessidades>;
  xp: number;
  /** Nível mínimo do pet para o alimento aparecer no carrossel. */
  nivelMinimo: number;
}

export interface RegistroAlimentacao {
  id: string;
  alimentoId: string;
  refeicao: Refeicao;
  em: Instante;
}
