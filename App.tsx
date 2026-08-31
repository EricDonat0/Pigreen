import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProvedorPreferencias } from './src/contexts/PreferenciasContext';
import { ProvedorAutenticacao } from './src/contexts/AutenticacaoContext';
import { ProvedorPet } from './src/contexts/PetContext';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * Composição raiz do Pigreen.
 *
 * A ordem dos provedores importa: preferências (tema e idioma) precisam existir
 * antes de qualquer tela desenhar, `ProvedorPet` depende da sessão exposta por
 * `ProvedorAutenticacao`, e a navegação depende dos três. Nenhuma lógica mora
 * aqui — este arquivo é só a montagem.
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProvedorPreferencias>
          <ProvedorAutenticacao>
            <ProvedorPet>
              <RootNavigator />
            </ProvedorPet>
          </ProvedorAutenticacao>
        </ProvedorPreferencias>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
