import { useState } from 'react';
import { Animated } from 'react-native';

/**
 * Cria um `Animated.Value` estável ao longo da vida do componente.
 *
 * O idioma tradicional em React Native é `useRef(new Animated.Value(0)).current`,
 * mas ler `.current` durante a renderização é justamente o que o React
 * desaconselha — e o que o compilador acusa. O estado com inicializador
 * preguiçoso dá a mesma identidade estável (o valor é criado uma única vez e
 * nunca substituído) sem tocar em ref durante o render.
 */
export function useValorAnimado(valorInicial: number): Animated.Value {
  const [valor] = useState(() => new Animated.Value(valorInicial));
  return valor;
}
