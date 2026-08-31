import React, { useCallback, useMemo, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Texto } from './Texto';
import { espacos, raios, useTema } from '../theme';
import type { Cores } from '../theme';

export const ALTURA_ITEM = 44;
const VISIVEIS = 5;
const ALTURA = ALTURA_ITEM * VISIVEIS;

export interface OpcaoRoda {
  valor: number;
  rotulo: string;
}

interface Props {
  rotulo: string;
  opcoes: readonly OpcaoRoda[];
  valor: number;
  aoMudar: (valor: number) => void;
  largura?: number;
}

/**
 * Roda de seleção vertical.
 *
 * Escrita à mão em vez de usar o seletor nativo por um motivo prático: no
 * Android o `DateTimePicker` embutido herda o tema do sistema e, sobre o fundo
 * creme do Pigreen, sai quase invisível. Aqui o contraste é nosso, o
 * comportamento é idêntico nas duas plataformas e o app perde uma dependência
 * nativa.
 *
 * O item central é o selecionado: o preenchimento de topo e base tem
 * exatamente duas alturas de item, então `offset / ALTURA_ITEM` é o índice.
 */
export function RodaSeletora({ rotulo, opcoes, valor, aoMudar, largura = 92 }: Props) {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);
  const scroll = useRef<ScrollView>(null);

  const indiceAtual = Math.max(
    0,
    opcoes.findIndex((o) => o.valor === valor),
  );

  /**
   * Posiciona a roda no valor atual assim que o conteúdo é medido.
   *
   * `contentOffset` resolveria isso numa linha, mas só é respeitado no iOS —
   * no Android e na web a roda abriria sempre no primeiro item, mostrando um
   * valor que não é o selecionado. O `ref` guarda que já posicionamos para que
   * rolagens seguintes do usuário não sejam desfeitas.
   */
  const posicionado = useRef(false);
  const posicionar = useCallback(() => {
    if (posicionado.current) return;
    posicionado.current = true;
    scroll.current?.scrollTo({ y: indiceAtual * ALTURA_ITEM, animated: false });
  }, [indiceAtual]);

  const aoTerminar = useCallback(
    (evento: NativeSyntheticEvent<NativeScrollEvent>) => {
      const indice = Math.round(evento.nativeEvent.contentOffset.y / ALTURA_ITEM);
      const opcao = opcoes[Math.max(0, Math.min(opcoes.length - 1, indice))];
      if (opcao && opcao.valor !== valor) aoMudar(opcao.valor);
    },
    [opcoes, valor, aoMudar],
  );

  return (
    <View style={{ width: largura }}>
      <Texto variante="micro" centralizado cor={cores.textoSecundario} style={estilos.rotulo}>
        {rotulo}
      </Texto>

      <View style={estilos.caixa}>
        {/* Faixa do item selecionado, atrás da lista. */}
        <View style={estilos.destaque} pointerEvents="none" />

        <ScrollView
          ref={scroll}
          showsVerticalScrollIndicator={false}
          snapToInterval={ALTURA_ITEM}
          decelerationRate="fast"
          onContentSizeChange={posicionar}
          onMomentumScrollEnd={aoTerminar}
          contentContainerStyle={estilos.conteudo}
          accessibilityLabel={rotulo}
        >
          {opcoes.map((opcao) => {
            const selecionada = opcao.valor === valor;
            return (
              <Pressable
                key={opcao.valor}
                style={estilos.item}
                accessibilityRole="button"
                accessibilityState={{ selected: selecionada }}
                accessibilityLabel={opcao.rotulo}
                onPress={() => {
                  aoMudar(opcao.valor);
                  const indice = opcoes.indexOf(opcao);
                  scroll.current?.scrollTo({ y: indice * ALTURA_ITEM, animated: true });
                }}
              >
                <Texto
                  variante={selecionada ? 'destaque' : 'corpo'}
                  centralizado
                  cor={selecionada ? cores.texto : cores.textoDesabilitado}
                >
                  {opcao.rotulo}
                </Texto>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    rotulo: { marginBottom: espacos.xxs },
    caixa: {
      height: ALTURA,
      borderRadius: raios.medio,
      backgroundColor: cores.fundoAfundado,
      overflow: 'hidden',
      justifyContent: 'center',
    },
    destaque: {
      position: 'absolute',
      left: espacos.xxs,
      right: espacos.xxs,
      height: ALTURA_ITEM,
      top: ALTURA_ITEM * 2,
      borderRadius: raios.pequeno,
      backgroundColor: cores.primariaSutil,
    },
    conteudo: { paddingVertical: ALTURA_ITEM * 2 },
    item: { height: ALTURA_ITEM, justifyContent: 'center' },
  });
