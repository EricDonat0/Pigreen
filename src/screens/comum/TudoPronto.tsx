import React, { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Texto } from '../../components/Texto';
import { useValorAnimado } from '../../hooks/useValorAnimado';
import { espacos, useTema } from '../../theme';
import type { Cores } from '../../theme';
import { useTraducao } from '../../contexts/PreferenciasContext';

/**
 * Confirmação exibida entre o login e o jogo — o "Tudo pronto" do protótipo.
 *
 * Não é um `setTimeout` fingindo carregamento dentro da tela de login: é um
 * estado real da navegação, montado só quando a sessão passa de deslogada para
 * logada dentro desta execução. Quem reabre o app já autenticado cai direto no
 * jogo, sem ver esta tela.
 */
export function TudoPronto() {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const escala = useValorAnimado(0.6);
  const opacidade = useValorAnimado(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(escala, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacidade, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [escala, opacidade]);

  return (
    <View style={estilos.container} accessible accessibilityLabel={t('tudoPronto.acessivel')}>
      <Animated.View
        style={[estilos.circulo, { opacity: opacidade, transform: [{ scale: escala }] }]}
      >
        <Feather name="check" size={40} color={cores.texto} />
      </Animated.View>
      <Animated.View style={{ opacity: opacidade }}>
        <Texto variante="displayPequeno" centralizado>
          {t('tudoPronto.titulo')}
        </Texto>
      </Animated.View>
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.fundo,
      alignItems: 'center',
      justifyContent: 'center',
      gap: espacos.lg,
    },
    circulo: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 2,
      borderColor: cores.borda,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
