import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnimacaoIntro from '../screens/auth/AnimacaoIntro';
import { TudoPronto } from '../screens/comum/TudoPronto';
import { PilhaAutenticacao } from './PilhaAutenticacao';
import { AbasCrianca } from './AbasCrianca';
import { useAutenticacao } from '../contexts/AutenticacaoContext';
import { useConfiguracoes } from '../contexts/PreferenciasContext';
import { useFontesPigreen } from '../theme';
import type { RotasRaiz } from './tipos';

const Pilha = createNativeStackNavigator<RotasRaiz>();

/** Quanto tempo a confirmação "Tudo pronto" fica na tela. */
const DURACAO_CONFIRMACAO = 1400;

/**
 * Raiz da navegação.
 *
 * Quatro portões antes de decidir o que mostrar: a splash animada precisa
 * terminar, as fontes precisam carregar, as preferências precisam ser lidas do
 * disco (senão o app pisca no tema errado) e a sessão precisa ser restaurada.
 * Só então escolhemos entre o fluxo de autenticação e o jogo.
 */
export function RootNavigator() {
  const { carregando, conta } = useAutenticacao();
  const { fontesCarregadas } = useFontesPigreen();
  const { cores, escuro, prontas } = useConfiguracoes();

  const [introTerminou, setIntroTerminou] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  /** `null` até sabermos o estado inicial; depois, o último valor observado. */
  const estavaLogado = useRef<boolean | null>(null);

  useEffect(() => {
    if (carregando) return;

    const logado = conta != null;
    const anterior = estavaLogado.current;
    estavaLogado.current = logado;

    // Só celebra a transição deslogado -> logado feita nesta sessão.
    if (anterior === false && logado) setConfirmando(true);
  }, [carregando, conta]);

  useEffect(() => {
    if (!confirmando) return;
    const t = setTimeout(() => setConfirmando(false), DURACAO_CONFIRMACAO);
    return () => clearTimeout(t);
  }, [confirmando]);

  const terminarIntro = useCallback(() => setIntroTerminou(true), []);

  const tema = useMemo(
    () => ({
      dark: escuro,
      colors: {
        primary: cores.primaria,
        background: cores.fundo,
        card: cores.fundo,
        text: cores.texto,
        border: cores.bordaSutil,
        notification: cores.primaria,
      },
      fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium: { fontFamily: 'System', fontWeight: '500' as const },
        bold: { fontFamily: 'System', fontWeight: '700' as const },
        heavy: { fontFamily: 'System', fontWeight: '800' as const },
      },
    }),
    [cores, escuro],
  );

  const barra = <StatusBar style={escuro ? 'light' : 'dark'} />;

  if (!introTerminou || !fontesCarregadas || !prontas || carregando) {
    return (
      <>
        {barra}
        <AnimacaoIntro aoTerminar={terminarIntro} />
      </>
    );
  }

  if (confirmando) {
    return (
      <>
        {barra}
        <TudoPronto />
      </>
    );
  }

  return (
    <NavigationContainer theme={tema}>
      {barra}
      <Pilha.Navigator screenOptions={{ headerShown: false }}>
        {conta ? (
          <Pilha.Screen name="Crianca" component={AbasCrianca} />
        ) : (
          <Pilha.Screen name="Autenticacao" component={PilhaAutenticacao} />
        )}
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
