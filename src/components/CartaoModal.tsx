import React, { ReactNode, useMemo } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Texto } from './Texto';
import { IMAGENS } from '../assets/registro';
import { alvoToque, espacos, raios, sombras, useTema } from '../theme';
import type { Cores } from '../theme';
import { useTraducao } from '../contexts/PreferenciasContext';

interface Props {
  visivel: boolean;
  aoFechar: () => void;
  titulo?: string;
  /** Mostra o porquinho espiando por cima do card, como nos mockups. */
  comPorquinho?: boolean;
  children?: ReactNode;
  /** Área de ações no rodapé do card. */
  rodape?: ReactNode;
}

/**
 * Card modal — o padrão de diálogo do Pigreen.
 *
 * Todos os avisos do app (informação de alimento, "Dorminhoco", subiu de
 * nível, confirmação de saída) usam esta mesma casca, para que a criança
 * aprenda uma única gramática visual: fundo do tema, cantos bem arredondados,
 * X no canto e o porquinho aparecendo por cima.
 */
export function CartaoModal({
  visivel,
  aoFechar,
  titulo,
  comPorquinho = false,
  children,
  rodape,
}: Props) {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      // Sem isto o botão físico de voltar do Android não fecha o diálogo.
      onRequestClose={aoFechar}
      statusBarTranslucent
    >
      <Pressable
        style={estilos.fundo}
        onPress={aoFechar}
        accessibilityRole="button"
        accessibilityLabel={t('comum.fechar')}
      >
        {/* O card intercepta o toque para que tocar dentro dele não feche. */}
        <Pressable style={estilos.card} onPress={() => undefined}>
          {comPorquinho && (
            <Image
              source={IMAGENS.porquinhoPiscando}
              style={estilos.porquinho}
              resizeMode="contain"
            />
          )}

          <Pressable
            onPress={aoFechar}
            hitSlop={12}
            style={estilos.fechar}
            accessibilityRole="button"
            accessibilityLabel={t('comum.fechar')}
          >
            <Feather name="x" size={22} color={cores.textoDesabilitado} />
          </Pressable>

          <ScrollView
            contentContainerStyle={estilos.conteudo}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {titulo && (
              <Texto variante="titulo" centralizado style={estilos.titulo}>
                {titulo}
              </Texto>
            )}
            {children}
          </ScrollView>

          {rodape && <View style={estilos.rodape}>{rodape}</View>}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    fundo: {
      flex: 1,
      backgroundColor: cores.veu,
      alignItems: 'center',
      justifyContent: 'center',
      padding: espacos.lg,
    },
    card: {
      width: '100%',
      maxWidth: 380,
      maxHeight: '80%',
      backgroundColor: cores.fundo,
      borderRadius: raios.grande,
      paddingTop: espacos.xl,
      paddingBottom: espacos.lg,
      paddingHorizontal: espacos.lg,
      ...sombras.flutuante,
    },
    porquinho: {
      position: 'absolute',
      top: -46,
      alignSelf: 'center',
      width: 96,
      height: 76,
    },
    fechar: {
      position: 'absolute',
      top: espacos.sm,
      right: espacos.sm,
      width: alvoToque / 2,
      height: alvoToque / 2,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3,
    },
    conteudo: { paddingBottom: espacos.xs },
    titulo: { marginBottom: espacos.sm },
    rodape: { marginTop: espacos.md },
  });
