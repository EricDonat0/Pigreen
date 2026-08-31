import { Platform, TextStyle } from 'react-native';

/**
 * Tipografia do Pigreen.
 *
 * A identidade visual define duas famílias (p. 17 da apresentação):
 *  - **Neulis Cursive** para títulos e nomes de alimentos (voz lúdica).
 *  - **Open Sans** para texto corrido (legibilidade infantil).
 *
 * Open Sans é carregada via `@expo-google-fonts/open-sans`. Neulis Cursive é
 * uma fonte comercial e portanto não é versionada no repositório: enquanto o
 * arquivo não estiver em `assets/fonts`, os títulos usam o peso ExtraBold de
 * Open Sans. Veja `carregarFontes` em `src/theme/fontes.ts` para o ponto único
 * de troca.
 */

export const familias = {
  /** Títulos, nomes próprios e rótulos lúdicos. */
  display: 'OpenSans_800ExtraBold',
  regular: 'OpenSans_400Regular',
  media: 'OpenSans_600SemiBold',
  negrito: 'OpenSans_700Bold',
} as const;

/**
 * Escala tipográfica em passos de ~1.25. Tamanhos generosos: o público
 * primário são crianças em fase de alfabetização.
 */
export const tamanhos = {
  micro: 11,
  pequeno: 13,
  corpo: 15,
  destaque: 17,
  titulo: 22,
  displayPequeno: 28,
  display: 36,
} as const;

type EstiloTexto = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'fontWeight'
>;

/**
 * `fontWeight` é mantido junto do `fontFamily` porque no Android o peso não é
 * inferido do nome da família; no iOS ele é ignorado quando há família custom.
 */
const peso = (valor: TextStyle['fontWeight']): TextStyle['fontWeight'] =>
  Platform.OS === 'android' ? undefined : valor;

export const textos = {
  display: {
    fontFamily: familias.display,
    fontSize: tamanhos.display,
    lineHeight: tamanhos.display * 1.15,
    fontWeight: peso('800'),
  },
  displayPequeno: {
    fontFamily: familias.display,
    fontSize: tamanhos.displayPequeno,
    lineHeight: tamanhos.displayPequeno * 1.2,
    fontWeight: peso('800'),
  },
  titulo: {
    fontFamily: familias.display,
    fontSize: tamanhos.titulo,
    lineHeight: tamanhos.titulo * 1.25,
    fontWeight: peso('700'),
  },
  destaque: {
    fontFamily: familias.media,
    fontSize: tamanhos.destaque,
    lineHeight: tamanhos.destaque * 1.4,
    fontWeight: peso('600'),
  },
  corpo: {
    fontFamily: familias.regular,
    fontSize: tamanhos.corpo,
    lineHeight: tamanhos.corpo * 1.5,
    fontWeight: peso('400'),
  },
  corpoForte: {
    fontFamily: familias.negrito,
    fontSize: tamanhos.corpo,
    lineHeight: tamanhos.corpo * 1.5,
    fontWeight: peso('700'),
  },
  legenda: {
    fontFamily: familias.regular,
    fontSize: tamanhos.pequeno,
    lineHeight: tamanhos.pequeno * 1.45,
    fontWeight: peso('400'),
  },
  micro: {
    fontFamily: familias.media,
    fontSize: tamanhos.micro,
    lineHeight: tamanhos.micro * 1.4,
    letterSpacing: 0.4,
    fontWeight: peso('600'),
  },
} satisfies Record<string, EstiloTexto>;

export type NomeTexto = keyof typeof textos;
