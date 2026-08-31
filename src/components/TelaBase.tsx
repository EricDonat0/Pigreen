import React, { ReactNode, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Texto } from './Texto';
import { alvoToque, espacos, useTema } from '../theme';
import type { Cores } from '../theme';
import { useTraducao } from '../contexts/PreferenciasContext';

interface Props {
  titulo: string;
  aoVoltar?: () => void;
  children: ReactNode;
  /** Conteúdo fixo no rodapé, fora da rolagem. */
  rodape?: ReactNode;
  /** Espaço extra no fim, para telas cobertas pela barra de abas flutuante. */
  espacoInferior?: number;
  rolavel?: boolean;
}

/**
 * Casca das telas internas: fundo do tema, cabeçalho com título e botão de
 * voltar, e rolagem que respeita o teclado.
 *
 * Existe para que as sete telas de ajustes e do responsável não repitam a
 * mesma montagem — e para que um ajuste de espaçamento valha para todas.
 */
export function TelaBase({
  titulo,
  aoVoltar,
  children,
  rodape,
  espacoInferior = espacos.xxl,
  rolavel = true,
}: Props) {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const corpo = rolavel ? (
    <ScrollView
      contentContainerStyle={[estilos.conteudo, { paddingBottom: espacoInferior }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[estilos.conteudo, estilos.fixo, { paddingBottom: espacoInferior }]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'left', 'right']}>
      <View style={estilos.cabecalho}>
        {aoVoltar ? (
          <Pressable
            onPress={aoVoltar}
            hitSlop={12}
            style={estilos.voltar}
            accessibilityRole="button"
            accessibilityLabel={t('comum.voltar')}
          >
            <Feather name="chevron-left" size={26} color={cores.texto} />
          </Pressable>
        ) : (
          <View style={estilos.voltar} />
        )}

        <Texto variante="titulo" centralizado numberOfLines={1} style={estilos.titulo}>
          {titulo}
        </Texto>

        <View style={estilos.voltar} />
      </View>

      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {corpo}
      </KeyboardAvoidingView>

      {rodape && <View style={estilos.rodape}>{rodape}</View>}
    </SafeAreaView>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.fundo },
    flex: { flex: 1 },
    cabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: espacos.sm,
      paddingVertical: espacos.xs,
    },
    voltar: {
      width: alvoToque,
      height: alvoToque,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulo: { flex: 1 },
    conteudo: { paddingHorizontal: espacos.lg, paddingTop: espacos.xs },
    fixo: { flex: 1 },
    rodape: {
      paddingHorizontal: espacos.lg,
      paddingBottom: espacos.md,
      paddingTop: espacos.xs,
    },
  });
