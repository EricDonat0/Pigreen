import React, { useEffect, useMemo } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { Texto } from '../Texto';
import { useValorAnimado } from '../../hooks/useValorAnimado';
import { SPRITES_PET } from '../../assets/registro';
import { buscarItem } from '../../domain/itens';
import { espacos, useTema } from '../../theme';
import { useTraducao } from '../../contexts/PreferenciasContext';
import type { ChaveTraducao } from '../../i18n';
import type { EstadoPet } from '../../types';

interface Props {
  estado: EstadoPet;
  nome: string;
  tamanho?: number;
  /** Ids de acessórios em uso, desenhados sobre o sprite. */
  itens?: readonly string[];
}

/** Como o porquinho se comporta em cada estado. */
const ANIMACAO: Record<EstadoPet, { duracao: number; deslocamento: number; inclinacao: number }> = {
  feliz: { duracao: 700, deslocamento: 14, inclinacao: 4 },
  normal: { duracao: 1600, deslocamento: 6, inclinacao: 0 },
  faminto: { duracao: 900, deslocamento: 3, inclinacao: 2 },
  triste: { duracao: 2600, deslocamento: 2, inclinacao: 0 },
  dormindo: { duracao: 3000, deslocamento: 4, inclinacao: 0 },
};

const CHAVE_ESTADO: Record<EstadoPet, ChaveTraducao> = {
  feliz: 'pet.feliz',
  normal: 'pet.normal',
  faminto: 'pet.faminto',
  triste: 'pet.triste',
  dormindo: 'pet.dormindo',
};

/**
 * O porquinho, sua animação de respiração e os acessórios equipados.
 *
 * O ciclo é um único valor animado de 0 a 1 em laço, do qual derivamos
 * translação e rotação — assim tudo roda na thread de UI (`useNativeDriver`) e
 * a animação não engasga quando o JS está ocupado salvando no Firestore.
 *
 * Se o sistema estiver com "reduzir movimento" ligado, o pet fica parado: a
 * informação de estado continua disponível pelo rótulo de acessibilidade e
 * pelos elementos ao redor.
 */
export function Porquinho({ estado, nome, tamanho = 200, itens = [] }: Props) {
  const t = useTraducao();
  const ciclo = useValorAnimado(0);
  const { duracao, deslocamento, inclinacao } = ANIMACAO[estado];

  useEffect(() => {
    let cancelado = false;
    let animacao: Animated.CompositeAnimation | null = null;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduzir) => {
      if (cancelado || reduzir) return;

      ciclo.setValue(0);
      animacao = Animated.loop(
        Animated.sequence([
          Animated.timing(ciclo, {
            toValue: 1,
            duration: duracao,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ciclo, {
            toValue: 0,
            duration: duracao,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      animacao.start();
    });

    return () => {
      cancelado = true;
      animacao?.stop();
    };
  }, [ciclo, duracao]);

  const transform = useMemo(
    () => [
      { translateY: ciclo.interpolate({ inputRange: [0, 1], outputRange: [0, -deslocamento] }) },
      {
        rotate: ciclo.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${inclinacao}deg`] }),
      },
      {
        // O pet dormindo "infla" de leve em vez de saltar.
        scale: ciclo.interpolate({
          inputRange: [0, 1],
          outputRange: [1, estado === 'dormindo' ? 1.03 : 1],
        }),
      },
    ],
    [ciclo, deslocamento, inclinacao, estado],
  );

  const altura = tamanho * 0.8;

  return (
    <View
      style={estilos.container}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${nome} ${t(CHAVE_ESTADO[estado])}`}
    >
      {estado === 'feliz' && <Coracoes ciclo={ciclo} />}
      {estado === 'dormindo' && <Zzz ciclo={ciclo} />}

      {/* Sprite e acessórios compartilham o mesmo `transform`, para que o
          chapéu acompanhe o pulo em vez de flutuar sozinho. */}
      <Animated.View style={[{ width: tamanho, height: altura }, { transform }]}>
        <Animated.Image
          source={SPRITES_PET[estado]}
          resizeMode="contain"
          style={[estilos.sprite, estado === 'triste' && estilos.desanimado]}
        />

        {itens.map((id) => {
          const item = buscarItem(id);
          if (!item) return null;
          const { x, y, escala, rotacao } = item.posicao;
          return (
            <Texto
              key={id}
              style={[
                estilos.acessorio,
                {
                  left: tamanho * x,
                  top: altura * y,
                  fontSize: tamanho * escala,
                  lineHeight: tamanho * escala * 1.1,
                  transform: rotacao ? [{ rotate: `${rotacao}deg` }] : undefined,
                },
              ]}
            >
              {item.emoji}
            </Texto>
          );
        })}
      </Animated.View>
    </View>
  );
}

function Coracoes({ ciclo }: { ciclo: Animated.Value }) {
  const { cores } = useTema();
  const posicoes = [
    { left: -8, top: 8, tamanho: 20 },
    { right: 0, top: 24, tamanho: 14 },
    { left: 18, top: 44, tamanho: 12 },
  ];

  return (
    <>
      {posicoes.map((p, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            estilos.enfeite,
            p,
            {
              opacity: ciclo.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              transform: [
                {
                  translateY: ciclo.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10 - i * 4],
                  }),
                },
              ],
            },
          ]}
        >
          <Texto variante="titulo" cor={cores.primaria} style={{ fontSize: p.tamanho }}>
            ♥
          </Texto>
        </Animated.View>
      ))}
    </>
  );
}

function Zzz({ ciclo }: { ciclo: Animated.Value }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        estilos.enfeite,
        { right: -4, top: 0 },
        {
          opacity: ciclo.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
          transform: [
            { translateY: ciclo.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
          ],
        },
      ]}
    >
      <Texto variante="titulo">z Z</Texto>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacos.lg,
  },
  sprite: { width: '100%', height: '100%' },
  desanimado: { opacity: 0.75 },
  acessorio: { position: 'absolute' },
  enfeite: { position: 'absolute', zIndex: 2 },
});
