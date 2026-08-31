import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { textos, useTema } from '../theme';
import type { NomeTexto } from '../theme';

interface Props extends TextProps {
  variante?: NomeTexto;
  cor?: string;
  centralizado?: boolean;
}

/**
 * Único ponto de entrada para texto no app. Existir força os estilos a virem
 * da escala tipográfica em vez de números soltos, e centraliza a cor padrão no
 * tema em vigor — trocar para o modo escuro não exige tocar em nenhuma tela.
 */
export function Texto({ variante = 'corpo', cor, centralizado = false, style, ...resto }: Props) {
  const { cores } = useTema();

  return (
    <Text
      // Respeita o tamanho de fonte do sistema, mas com teto: acima de 1.4x o
      // layout do cenário do jogo começa a quebrar.
      maxFontSizeMultiplier={1.4}
      style={[textos[variante], { color: cor ?? cores.texto }, centralizado && estilos.centralizado, style]}
      {...resto}
    />
  );
}

const estilos = StyleSheet.create({
  centralizado: { textAlign: 'center' },
});
