import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Texto } from '../Texto';
import { espacos, raios, sombras, useTema } from '../../theme';
import type { Cores } from '../../theme';
import { useTraducao } from '../../contexts/PreferenciasContext';

interface Props {
  nivel: number;
  /** Progresso dentro do nível atual, de 0 a 1. */
  progresso: number;
  nomePet: string;
}

/**
 * Medalha de nível com barra de progresso, no canto superior da tela do jogo.
 * O número fica dentro de um círculo destacado porque é a única informação da
 * HUD que a criança usa como meta.
 */
export function HudNivel({ nivel, progresso, nomePet }: Props) {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);
  const porcentagem = Math.round(Math.max(0, Math.min(1, progresso)) * 100);

  return (
    <View
      style={estilos.container}
      accessible
      accessibilityLabel={t('jogo.hudNivel', { nome: nomePet, nivel, porcentagem })}
    >
      <View style={estilos.medalha}>
        <Texto variante="destaque">{nivel}</Texto>
      </View>

      <View style={estilos.barra}>
        <View style={[estilos.preenchimento, { width: `${porcentagem}%` }]} />
      </View>
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: espacos.xs },
    medalha: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: cores.fundo,
      borderWidth: 3,
      borderColor: cores.primariaSuave,
      alignItems: 'center',
      justifyContent: 'center',
      ...sombras.cartao,
    },
    barra: {
      width: 90,
      height: 10,
      borderRadius: raios.pilula,
      backgroundColor: cores.fundo,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: cores.bordaSutil,
    },
    preenchimento: { height: '100%', backgroundColor: cores.primaria },
  });
