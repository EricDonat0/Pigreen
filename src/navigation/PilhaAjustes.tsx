import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ajustes from '../screens/ajustes/Ajustes';
import EditarPerfil from '../screens/ajustes/EditarPerfil';
import AlterarSenha from '../screens/ajustes/AlterarSenha';
import Aparencia from '../screens/ajustes/Aparencia';
import Idioma from '../screens/ajustes/Idioma';
import NomePet from '../screens/ajustes/NomePet';
import Customizacao from '../screens/ajustes/Customizacao';
import AreaResponsavel from '../screens/responsavel/AreaResponsavel';
import type { RotasAjustes } from './tipos';

const Pilha = createNativeStackNavigator<RotasAjustes>();

/**
 * Pilha da aba de perfil. Cada ajuste é uma rota própria em vez de um modal:
 * assim o gesto de voltar do sistema funciona, e o histórico fica correto
 * quando o usuário desce dois níveis (ajustes → área do responsável → PIN).
 */
export function PilhaAjustes() {
  return (
    <Pilha.Navigator screenOptions={{ headerShown: false }}>
      <Pilha.Screen name="Ajustes" component={Ajustes} />
      <Pilha.Screen name="EditarPerfil" component={EditarPerfil} />
      <Pilha.Screen name="AlterarSenha" component={AlterarSenha} />
      <Pilha.Screen name="Aparencia" component={Aparencia} />
      <Pilha.Screen name="Idioma" component={Idioma} />
      <Pilha.Screen name="NomePet" component={NomePet} />
      <Pilha.Screen name="Customizacao" component={Customizacao} />
      <Pilha.Screen name="AreaResponsavel" component={AreaResponsavel} />
    </Pilha.Navigator>
  );
}
