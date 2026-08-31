import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/auth/Login';
import Cadastro from '../screens/auth/Cadastro';
import EsqueciSenha from '../screens/auth/EsqueciSenha';
import type { RotasAutenticacao } from './tipos';

const Pilha = createNativeStackNavigator<RotasAutenticacao>();

/**
 * Fluxo de entrada. Sem cabeçalho: cada tela desenha seu próprio bottom sheet
 * sobre o fundo de tijolos.
 *
 * O cadastro entra deslizando de baixo, mas como uma tela **opaca**: uma
 * apresentação transparente deixaria a tela de login visível por trás da
 * folha, o que na prática empilha dois porquinhos e dois fundos de tijolo.
 */
export function PilhaAutenticacao() {
  return (
    <Pilha.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Pilha.Screen name="Login" component={Login} />
      <Pilha.Screen
        name="Cadastro"
        component={Cadastro}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Pilha.Screen name="EsqueciSenha" component={EsqueciSenha} />
    </Pilha.Navigator>
  );
}
