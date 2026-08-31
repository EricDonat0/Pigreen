import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/crianca/Home';
import AreaOnline from '../screens/online/AreaOnline';
import { PilhaAjustes } from './PilhaAjustes';
import { BarraAbas } from './BarraAbas';
import type { RotasCrianca } from './tipos';

const Abas = createBottomTabNavigator<RotasCrianca>();

/**
 * Abas da experiência infantil. "Porquinho" fica no meio e é a rota inicial:
 * é a tela que a criança espera ver ao abrir o app.
 */
export function AbasCrianca() {
  return (
    <Abas.Navigator
      initialRouteName="Porquinho"
      tabBar={(props) => <BarraAbas {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Abas.Screen name="Amigos" component={AreaOnline} />
      <Abas.Screen name="Porquinho" component={Home} />
      <Abas.Screen name="Perfil" component={PilhaAjustes} />
    </Abas.Navigator>
  );
}
