import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Texto } from './Texto';
import { alvoToque, espacos, raios, sombras, useTema } from '../theme';

type Variante = 'primaria' | 'secundaria' | 'fantasma' | 'perigo';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: ViewStyle;
  /** Texto lido por leitores de tela quando o rótulo visível não basta. */
  rotuloAcessivel?: string;
}

export function BotaoPrimario({
  titulo,
  onPress,
  variante = 'primaria',
  carregando = false,
  desabilitado = false,
  style,
  rotuloAcessivel,
}: Props) {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(), []);
  const inativo = desabilitado || carregando;

  const fundos: Record<Variante, string> = {
    primaria: cores.primariaSuave,
    secundaria: cores.secundaria,
    fantasma: cores.transparente,
    perigo: cores.erro,
  };
  const textos: Record<Variante, string> = {
    primaria: cores.sobrePrimaria,
    secundaria: cores.textoSobreEscuro,
    fantasma: cores.texto,
    perigo: '#FFFFFF',
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        estilos.base,
        { backgroundColor: fundos[variante] },
        variante === 'fantasma' && estilos.fantasma,
        // Feedback tátil imediato: crianças pequenas precisam ver que o toque
        // "pegou" antes de a ação terminar.
        pressed && !inativo && estilos.pressionado,
        inativo && estilos.inativo,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={textos[variante]} />
      ) : (
        <Texto variante="destaque" cor={textos[variante]}>
          {titulo}
        </Texto>
      )}
    </Pressable>
  );
}

const criarEstilos = () =>
  StyleSheet.create({
    base: {
      minHeight: alvoToque,
      paddingVertical: espacos.sm,
      paddingHorizontal: espacos.lg,
      borderRadius: raios.pilula,
      alignItems: 'center',
      justifyContent: 'center',
      ...sombras.cartao,
    },
    fantasma: { shadowOpacity: 0, elevation: 0 },
    pressionado: { transform: [{ scale: 0.97 }], opacity: 0.9 },
    inativo: { opacity: 0.5 },
  });
