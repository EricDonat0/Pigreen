import React, { useEffect, useMemo } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Texto } from '../Texto';
import { useValorAnimado } from '../../hooks/useValorAnimado';
import { espacos, raios, useTema } from '../../theme';
import type { Cores } from '../../theme';
import { useTraducao } from '../../contexts/PreferenciasContext';
import type { ChaveNecessidade, DescricaoNecessidade } from '../../domain/necessidades';

interface Props {
  descricao: DescricaoNecessidade;
  /** Valor de 0 a 100. */
  valor: number;
  aoTocarAjuda: (descricao: DescricaoNecessidade) => void;
  compacta?: boolean;
}

/**
 * Barra de uma necessidade, com ícone, preenchimento animado e botão de ajuda.
 *
 * O valor é comunicado por três canais independentes — largura, cor e rótulo
 * de acessibilidade — porque cor sozinha não é informação acessível, e porque
 * uma criança que ainda não lê percentuais entende a barra cheia.
 */
export function BarraNecessidade({ descricao, valor, aoTocarAjuda, compacta = false }: Props) {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);
  const progresso = useValorAnimado(valor);

  useEffect(() => {
    Animated.timing(progresso, {
      toValue: Math.max(0, Math.min(100, valor)),
      duration: 450,
      // A largura não é animável na thread nativa; o custo é irrelevante para
      // três barras e o resultado é mais fiel do que animar `scaleX`.
      useNativeDriver: false,
    }).start();
  }, [valor, progresso]);

  const largura = progresso.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const rotulo = t(descricao.chaveRotulo);

  const corDaBarra: Record<ChaveNecessidade, string> = {
    saude: cores.status.saude,
    saciedade: cores.status.fome,
    felicidade: cores.status.felicidade,
  };

  return (
    <View
      style={estilos.linha}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={rotulo}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(valor) }}
    >
      <MaterialCommunityIcons
        name={descricao.icone}
        size={compacta ? 18 : 22}
        color={cores.texto}
      />

      <View style={estilos.coluna}>
        {!compacta && (
          <Texto variante="micro" style={estilos.rotulo}>
            {rotulo}
          </Texto>
        )}
        <View style={[estilos.trilho, compacta && estilos.trilhoCompacto]}>
          <Animated.View
            style={[
              estilos.preenchimento,
              { width: largura, backgroundColor: corDaBarra[descricao.chave] },
            ]}
          />
        </View>
      </View>

      <Pressable
        onPress={() => aoTocarAjuda(descricao)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('jogo.comoFunciona', { nome: rotulo })}
      >
        <MaterialCommunityIcons name="information-outline" size={20} color={cores.texto} />
      </Pressable>
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espacos.xs,
      marginBottom: espacos.xs,
    },
    coluna: { flex: 1 },
    rotulo: { marginBottom: 2 },
    trilho: {
      height: 12,
      borderRadius: raios.pilula,
      backgroundColor: cores.status.trilho,
      borderWidth: 1,
      borderColor: cores.bordaSutil,
      overflow: 'hidden',
    },
    trilhoCompacto: { height: 8 },
    preenchimento: { height: '100%', borderRadius: raios.pilula },
  });
