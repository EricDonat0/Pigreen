import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTema } from '../../theme';
import type { Cores } from '../../theme';

/**
 * Pastinho onde o porquinho mora.
 *
 * Desenhado em componentes nativos em vez de uma imagem única por três razões:
 * fica nítido em qualquer densidade de tela, se adapta a telas altas e baixas
 * sem cortar o horizonte, e acompanha o tema — no modo escuro o mesmo cenário
 * vira um fim de tarde, coisa que um PNG não faria sozinho.
 *
 * Para substituir por um asset exportado do Figma, troque o corpo por um
 * `<ImageBackground>`: a interface do componente (só `children`) foi mantida
 * mínima justamente para isso.
 */
export function Cenario({ children }: { children?: ReactNode }) {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  return (
    <View style={estilos.container}>
      <LinearGradient
        colors={[cores.ceuTopo, cores.fundoCeu]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Nuvens: elipses simples, em porcentagem para acompanhar a altura da
          tela. Ficam abaixo de 25% de propósito — a faixa superior pertence à
          HUD, e nuvem atrás de texto vira ruído. */}
      <View style={[estilos.nuvem, { top: '30%', left: '8%', width: 86, height: 30 }]} />
      <View style={[estilos.nuvem, { top: '38%', right: '10%', width: 62, height: 22 }]} />
      <View style={[estilos.nuvem, { top: '27%', left: '46%', width: 46, height: 17 }]} />

      {/* Colinas: dois blocos arredondados sobrepostos criam a silhueta do
          campo sem precisar de SVG. */}
      <View style={estilos.colinaFundo} />
      <View style={estilos.colinaFrente} />
      <View style={estilos.chao} />

      <View style={estilos.conteudo}>{children}</View>
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    container: { flex: 1, overflow: 'hidden', backgroundColor: cores.fundoCeu },
    nuvem: {
      position: 'absolute',
      backgroundColor: cores.fundo,
      borderRadius: 999,
      opacity: 0.9,
    },
    colinaFundo: {
      position: 'absolute',
      left: '-25%',
      right: '-25%',
      top: '50%',
      height: '32%',
      backgroundColor: cores.colinaFundo,
      borderTopLeftRadius: 400,
      borderTopRightRadius: 400,
    },
    colinaFrente: {
      position: 'absolute',
      left: '-40%',
      right: '-10%',
      top: '58%',
      height: '32%',
      backgroundColor: cores.colinaFrente,
      borderTopLeftRadius: 500,
      borderTopRightRadius: 500,
    },
    chao: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '24%',
      backgroundColor: cores.colinaFrente,
    },
    conteudo: { flex: 1 },
  });
