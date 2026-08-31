import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Texto } from './Texto';
import { espacos, useTema } from '../theme';
import type { Cores } from '../theme';

export const TAMANHO_PIN = 4;

interface Props {
  valor: string;
  aoMudar: (valor: string) => void;
  desabilitado?: boolean;
}

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'apagar'] as const;

/**
 * Teclado numérico do PIN, com os quatro círculos de progresso.
 *
 * Teclado próprio em vez de um `TextInput` numérico por dois motivos: o teclado
 * do sistema cobriria metade da tela num diálogo curto, e aqui o alvo de toque
 * é grande e previsível — a mão que digita este PIN costuma estar com pressa.
 */
export function TecladoPin({ valor, aoMudar, desabilitado = false }: Props) {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const digitar = (tecla: string) => {
    if (desabilitado) return;
    if (tecla === 'apagar') {
      aoMudar(valor.slice(0, -1));
      return;
    }
    if (valor.length >= TAMANHO_PIN) return;
    aoMudar(valor + tecla);
  };

  return (
    <View>
      <View
        style={estilos.marcadores}
        accessible
        accessibilityLabel={`${valor.length} de ${TAMANHO_PIN}`}
      >
        {Array.from({ length: TAMANHO_PIN }, (_, i) => (
          <View key={i} style={[estilos.ponto, i < valor.length && estilos.pontoCheio]}>
            {i < valor.length && (
              <Texto variante="titulo" cor={cores.sobrePrimaria}>
                *
              </Texto>
            )}
          </View>
        ))}
      </View>

      <View style={estilos.grade}>
        {TECLAS.map((tecla, indice) =>
          tecla === '' ? (
            <View key={`vazio-${indice}`} style={estilos.tecla} />
          ) : (
            <Pressable
              key={tecla}
              onPress={() => digitar(tecla)}
              disabled={desabilitado}
              accessibilityRole="button"
              accessibilityLabel={tecla === 'apagar' ? 'Apagar' : tecla}
              style={({ pressed }) => [
                estilos.tecla,
                estilos.teclaAtiva,
                pressed && estilos.pressionada,
                desabilitado && estilos.inativa,
              ]}
            >
              {tecla === 'apagar' ? (
                <Feather name="delete" size={22} color={cores.texto} />
              ) : (
                <Texto variante="titulo">{tecla}</Texto>
              )}
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    marcadores: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: espacos.sm,
      marginBottom: espacos.xl,
    },
    ponto: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: cores.primariaSutil,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pontoCheio: { backgroundColor: cores.primariaSuave },
    grade: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: espacos.sm,
      maxWidth: 280,
      alignSelf: 'center',
    },
    tecla: {
      width: 76,
      height: 62,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
    },
    teclaAtiva: { backgroundColor: cores.fundoElevado },
    pressionada: { backgroundColor: cores.primariaSutil, transform: [{ scale: 0.96 }] },
    inativa: { opacity: 0.5 },
  });
