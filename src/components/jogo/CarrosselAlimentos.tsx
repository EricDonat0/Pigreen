import React, { useCallback, useMemo } from 'react';
import { FlatList, Image, ListRenderItemInfo, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Texto } from '../Texto';
import { IMAGENS_ALIMENTOS } from '../../assets/registro';
import { chavesDoAlimento } from '../../domain/alimentos';
import { espacos, raios, sombras, useTema } from '../../theme';
import type { Cores } from '../../theme';
import { useTraducao } from '../../contexts/PreferenciasContext';
import type { Tradutor } from '../../i18n';
import type { Alimento } from '../../types';

const LARGURA_CARD = 108;
const ESPACO = espacos.sm;

export interface ItemCarrossel {
  alimento: Alimento;
  bloqueado: boolean;
}

interface Props {
  itens: readonly ItemCarrossel[];
  aoSelecionar: (alimento: Alimento) => void;
  desabilitado?: boolean;
}

/**
 * Carrossel horizontal de alimentos, no rodapé da tela do jogo.
 *
 * Alimentos bloqueados continuam visíveis com cadeado: o Figma trata isso como
 * mecânica de motivação, não como ruído — a criança precisa ver o que vem
 * depois para querer chegar lá.
 */
export function CarrosselAlimentos({ itens, aoSelecionar, desabilitado = false }: Props) {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const renderizar = useCallback(
    ({ item }: ListRenderItemInfo<ItemCarrossel>) => (
      <CardAlimento
        item={item}
        aoSelecionar={aoSelecionar}
        desabilitado={desabilitado || item.bloqueado}
        estilos={estilos}
        cores={cores}
        t={t}
      />
    ),
    [aoSelecionar, desabilitado, estilos, cores, t],
  );

  return (
    <FlatList
      horizontal
      data={itens}
      keyExtractor={(item) => item.alimento.id}
      renderItem={renderizar}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.lista}
      // Encaixa um card por vez em vez de rolagem livre: alvo mais previsível
      // para quem ainda não domina o gesto de arrastar.
      snapToInterval={LARGURA_CARD + ESPACO}
      decelerationRate="fast"
      getItemLayout={(_, index) => ({
        length: LARGURA_CARD + ESPACO,
        offset: (LARGURA_CARD + ESPACO) * index,
        index,
      })}
    />
  );
}

function CardAlimento({
  item,
  aoSelecionar,
  desabilitado,
  estilos,
  cores,
  t,
}: {
  item: ItemCarrossel;
  aoSelecionar: (alimento: Alimento) => void;
  desabilitado: boolean;
  estilos: ReturnType<typeof criarEstilos>;
  cores: Cores;
  t: Tradutor;
}) {
  const { alimento, bloqueado } = item;
  const imagem = IMAGENS_ALIMENTOS[alimento.id];
  const nome = t(chavesDoAlimento(alimento.id).nome);

  return (
    <Pressable
      onPress={() => aoSelecionar(alimento)}
      disabled={desabilitado && !bloqueado}
      accessibilityRole="button"
      accessibilityLabel={
        bloqueado
          ? t('jogo.bloqueado', { nome, nivel: alimento.nivelMinimo })
          : t('jogo.oferecer', { nome })
      }
      accessibilityState={{ disabled: bloqueado }}
      style={({ pressed }) => [
        estilos.card,
        pressed && !desabilitado && estilos.pressionado,
        desabilitado && !bloqueado && estilos.inativo,
      ]}
    >
      <View style={estilos.moldura}>
        {bloqueado ? (
          <MaterialCommunityIcons name="lock" size={30} color={cores.textoDesabilitado} />
        ) : imagem ? (
          <Image source={imagem} style={estilos.foto} resizeMode="cover" />
        ) : (
          // Marcador enquanto a foto do alimento não é exportada do Figma.
          <View style={estilos.marcador}>
            <Texto variante="titulo" cor={cores.terra}>
              {nome.charAt(0)}
            </Texto>
          </View>
        )}
      </View>

      <Texto
        variante="micro"
        centralizado
        cor={bloqueado ? cores.textoDesabilitado : cores.texto}
        numberOfLines={2}
      >
        {bloqueado ? t('jogo.nivelCurto', { nivel: alimento.nivelMinimo }) : nome}
      </Texto>
    </Pressable>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    lista: { paddingHorizontal: espacos.md, gap: ESPACO, paddingVertical: espacos.xs },
    card: {
      width: LARGURA_CARD,
      backgroundColor: cores.fundo,
      borderRadius: raios.medio,
      paddingVertical: espacos.sm,
      paddingHorizontal: espacos.xs,
      alignItems: 'center',
      gap: espacos.xs,
      ...sombras.cartao,
    },
    pressionado: { transform: [{ scale: 0.95 }] },
    inativo: { opacity: 0.45 },
    moldura: {
      width: 64,
      height: 64,
      borderRadius: 32,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cores.fundoAfundado,
    },
    foto: { width: '100%', height: '100%' },
    marcador: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cores.primariaSutil,
    },
  });
