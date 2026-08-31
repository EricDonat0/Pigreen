import type { ImageSourcePropType } from 'react-native';
import type { EstadoPet } from '../types';

/**
 * Registro central de imagens.
 *
 * `require` é resolvido em build time pelo Metro, então não dá para montar o
 * caminho dinamicamente — daí o mapa explícito. Concentrá-lo aqui garante que
 * um asset faltando quebre neste arquivo, e não no meio de uma tela.
 */

export const IMAGENS = {
  logo: require('../../assets/fundo_logo.png') as ImageSourcePropType,
  tijolos: require('../../assets/fundo_tijolos.png') as ImageSourcePropType,
  tijolosLogin: require('../../assets/fundo_tijolos_login.png') as ImageSourcePropType,
  porquinhoAndando: require('../../assets/pig_walking.png') as ImageSourcePropType,
  porquinhoPiscando: require('../../assets/pig_winking.png') as ImageSourcePropType,
} as const;

/**
 * Sprite por estado emocional.
 *
 * O Figma prevê ilustrações distintas para feliz, triste, faminto e dormindo.
 * Enquanto elas não forem exportadas, todos os estados caem no sprite padrão —
 * a diferença fica por conta da animação e dos elementos ao redor (coraçõezinhos,
 * "zZ"), que já são renderizados em código. Ao exportar cada variante para
 * `assets/pig_<estado>.png`, basta trocar a linha correspondente aqui.
 */
export const SPRITES_PET: Record<EstadoPet, ImageSourcePropType> = {
  feliz: IMAGENS.porquinhoPiscando,
  normal: IMAGENS.porquinhoAndando,
  faminto: IMAGENS.porquinhoAndando,
  triste: IMAGENS.porquinhoAndando,
  dormindo: IMAGENS.porquinhoPiscando,
};

/**
 * Fotos dos alimentos, indexadas pelo id do catálogo.
 *
 * Ainda não exportadas do Figma. `undefined` faz o card cair no marcador
 * ilustrado de `CardAlimento`, que já respeita a paleta — a tela funciona
 * inteira sem os arquivos, e passa a mostrar as fotos assim que eles entrarem.
 */
export const IMAGENS_ALIMENTOS: Partial<Record<string, ImageSourcePropType>> = {
  // arroz: require('../../assets/alimentos/arroz.png'),
  // feijao: require('../../assets/alimentos/feijao.png'),
  // ...
};
