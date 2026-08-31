import type { Persistence } from 'firebase/auth';

/**
 * O SDK do Firebase publica entradas diferentes por plataforma. O Metro
 * resolve `firebase/auth` pela condição `react-native`, que exporta
 * `getReactNativePersistence`; o TypeScript, porém, segue o campo `types` do
 * pacote guarda-chuva, que aponta para a entrada web — onde essa função não
 * existe.
 *
 * A declaração abaixo alinha os tipos ao módulo que realmente roda no
 * dispositivo. Pode ser removida quando o pacote `firebase` passar a expor a
 * condição `react-native` na subrota `./auth`.
 *
 * @see https://github.com/firebase/firebase-js-sdk/issues/7615
 */
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
