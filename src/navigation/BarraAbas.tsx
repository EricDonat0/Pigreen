import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { alvoToque, espacos, raios, sombras, useTema } from '../theme';
import type { Cores } from '../theme';
import { useTraducao } from '../contexts/PreferenciasContext';
import type { ChaveTraducao } from '../i18n';

type NomeIcone = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const ICONES: Record<string, NomeIcone> = {
  Amigos: 'account-group',
  Porquinho: 'pig',
  Perfil: 'cog',
};

const ROTULOS: Record<string, ChaveTraducao> = {
  Amigos: 'abas.amigos',
  Porquinho: 'abas.porquinho',
  Perfil: 'abas.ajustes',
};

/**
 * Barra de abas customizada, no formato de pílula flutuante do Figma: fundo
 * do tema arredondado, três destinos e o porquinho no centro, maior que os
 * vizinhos.
 *
 * Feita à mão em vez de estilizar a barra padrão porque o item central precisa
 * escapar da altura da barra — algo que a API de `tabBarStyle` não permite.
 */
export function BarraAbas({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  return (
    <View style={[estilos.container, { paddingBottom: Math.max(insets.bottom, espacos.sm) }]}>
      <View style={estilos.pilula}>
        {state.routes.map((route, indice) => {
          const focada = state.index === indice;
          const central = route.name === 'Porquinho';

          const aoTocar = () => {
            const evento = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focada && !evento.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={aoTocar}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              accessibilityRole="button"
              accessibilityState={{ selected: focada }}
              accessibilityLabel={t(ROTULOS[route.name] ?? 'abas.porquinho')}
              style={[estilos.item, central && estilos.itemCentral]}
            >
              <MaterialCommunityIcons
                name={ICONES[route.name] ?? 'circle'}
                size={central ? 32 : 24}
                color={focada ? cores.primaria : cores.terra}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      paddingHorizontal: espacos.lg,
      backgroundColor: cores.transparente,
    },
    pilula: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      width: '100%',
      maxWidth: 340,
      backgroundColor: cores.fundo,
      borderRadius: raios.pilula,
      paddingVertical: espacos.xs,
      ...sombras.flutuante,
    },
    item: {
      minWidth: alvoToque,
      minHeight: alvoToque,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemCentral: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: cores.primariaSutil,
      marginTop: -18,
      borderWidth: 4,
      borderColor: cores.fundo,
    },
  });
