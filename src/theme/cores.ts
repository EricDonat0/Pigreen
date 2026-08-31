/**
 * Paleta do Pigreen, em duas variantes.
 *
 * A base vem do estudo de identidade visual (Mariana Moraes, p. 16). O tema
 * escuro não é uma inversão automática: os rosas e verdes da marca perdem
 * saturação percebida sobre fundo escuro, então são clareados à mão para
 * manter o contraste de texto acima de 4.5:1 e o pastel continuar lendo como
 * pastel.
 *
 * As cores são expostas por *papel semântico*, nunca por matiz — é o que
 * permite trocar a paleta inteira sem varrer a árvore de componentes.
 */

const marca = {
  rosa: '#F39AB0',
  rosaClaro: '#FCCDCD',
  verde: '#68A339',
  verdeClaro: '#91AE4D',
  marrom: '#7D4F33',
  marromEscuro: '#664137',
} as const;

export interface Cores {
  fundo: string;
  fundoElevado: string;
  fundoAfundado: string;
  fundoCeu: string;
  ceuTopo: string;
  colinaFundo: string;
  colinaFrente: string;

  primaria: string;
  primariaSuave: string;
  primariaSutil: string;
  sobrePrimaria: string;

  secundaria: string;
  secundariaSuave: string;

  terra: string;
  terraEscura: string;

  texto: string;
  textoSecundario: string;
  textoDesabilitado: string;
  textoSobreEscuro: string;

  borda: string;
  bordaSutil: string;

  erro: string;
  alerta: string;
  sucesso: string;

  status: {
    saude: string;
    fome: string;
    felicidade: string;
    trilho: string;
  };

  veu: string;
  transparente: string;
}

const CLARO: Cores = {
  fundo: '#FDF9F0',
  fundoElevado: '#FFFFFF',
  fundoAfundado: '#F5EEDF',
  fundoCeu: '#A9DDF3',
  ceuTopo: '#BFE7F7',
  colinaFundo: marca.verdeClaro,
  colinaFrente: marca.verde,

  primaria: marca.rosa,
  primariaSuave: marca.rosaClaro,
  primariaSutil: '#FFE3E8',
  sobrePrimaria: '#1A1A1A',

  secundaria: marca.verde,
  secundariaSuave: marca.verdeClaro,

  terra: marca.marrom,
  terraEscura: marca.marromEscuro,

  texto: '#1A1A1A',
  textoSecundario: '#5B5B5B',
  textoDesabilitado: '#9E9E9E',
  textoSobreEscuro: '#FFFFFF',

  borda: '#1A1A1A',
  bordaSutil: '#E5E1D8',

  erro: '#D93B41',
  alerta: '#B87400',
  sucesso: '#4F7F27',

  status: {
    saude: marca.rosa,
    fome: marca.verdeClaro,
    felicidade: marca.rosaClaro,
    trilho: '#FFFFFF',
  },

  veu: 'rgba(0,0,0,0.35)',
  transparente: 'transparent',
};

const ESCURO: Cores = {
  fundo: '#1C1A18',
  fundoElevado: '#272320',
  fundoAfundado: '#151311',
  // O céu do cenário vira um fim de tarde em vez de um azul apagado.
  fundoCeu: '#2E3D52',
  ceuTopo: '#1F2B3D',
  colinaFundo: '#3F5A2A',
  colinaFrente: '#33491F',

  primaria: '#F5AABE',
  primariaSuave: '#8A5866',
  primariaSutil: '#3A2B2F',
  sobrePrimaria: '#FFFFFF',

  secundaria: '#8CC55C',
  secundariaSuave: '#6E8F3D',

  terra: '#C79574',
  terraEscura: '#A87A5A',

  texto: '#F5F1EA',
  textoSecundario: '#B8B0A6',
  textoDesabilitado: '#7A736B',
  textoSobreEscuro: '#FFFFFF',

  borda: '#F5F1EA',
  bordaSutil: '#3A342E',

  erro: '#FF8A8F',
  alerta: '#F0B24A',
  sucesso: '#9BD26A',

  status: {
    saude: '#F5AABE',
    fome: '#A9C86B',
    felicidade: '#E0A9B8',
    trilho: '#3A342E',
  },

  veu: 'rgba(0,0,0,0.6)',
  transparente: 'transparent',
};

export type ModoTema = 'claro' | 'escuro';

export function paletaDoModo(modo: ModoTema): Cores {
  return modo === 'escuro' ? ESCURO : CLARO;
}

/**
 * Paleta clara em forma de constante, para os poucos lugares que precisam de
 * cor fora da árvore React (ícone adaptativo, cor de fundo nativa da splash).
 */
export const CORES_CLARAS = CLARO;
