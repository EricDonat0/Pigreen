import React, { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { useValorAnimado } from '../../hooks/useValorAnimado';
import { IMAGENS } from '../../assets/registro';
import { useTema } from '../../theme';
import type { Cores } from '../../theme';
import { useTraducao } from '../../contexts/PreferenciasContext';

interface Props {
  aoTerminar: () => void;
}

const DURACAO_CAMINHADA = 2200;
const PAUSA = 300;
const DURACAO_PISCADA = 1000;

/**
 * Splash animada: o porquinho atravessa a tela e pisca ao chegar.
 *
 * Existe um único cronômetro, guardado por uma flag: a animação é enfeite, não
 * o mecanismo de navegação, e chamar `aoTerminar` duas vezes deixaria o app
 * preso entre duas rotas.
 */
export default function AnimacaoIntro({ aoTerminar }: Props) {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const largura = Dimensions.get('window').width;
  const posicao = useValorAnimado(largura);
  const [piscando, setPiscando] = useState(false);

  useEffect(() => {
    let finalizado = false;
    const finalizar = () => {
      if (finalizado) return;
      finalizado = true;
      aoTerminar();
    };

    const cronometro = setTimeout(finalizar, DURACAO_CAMINHADA + PAUSA + DURACAO_PISCADA);
    const trocaSprite = setTimeout(() => setPiscando(true), DURACAO_CAMINHADA + PAUSA);

    let animacao: Animated.CompositeAnimation | null = null;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduzir) => {
      if (reduzir) {
        posicao.setValue(0);
        return;
      }
      animacao = Animated.timing(posicao, {
        toValue: 0,
        duration: DURACAO_CAMINHADA,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
      animacao.start();
    });

    return () => {
      clearTimeout(cronometro);
      clearTimeout(trocaSprite);
      animacao?.stop();
    };
  }, [aoTerminar, posicao]);

  return (
    <View style={estilos.container} accessible accessibilityLabel={t('intro.acessivel')}>
      <Image source={IMAGENS.logo} style={estilos.logo} resizeMode="contain" />
      <Animated.Image
        source={piscando ? IMAGENS.porquinhoPiscando : IMAGENS.porquinhoAndando}
        style={[estilos.porquinho, { transform: [{ translateX: posicao }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.fundo,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: { width: 220, height: 220 },
    porquinho: {
      position: 'absolute',
      width: 124,
      height: 99,
      bottom: '10%',
      right: '5%',
    },
  });
