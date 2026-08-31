import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Texto } from '../../components/Texto';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { espacos, useTema } from '../../theme';
import type { Cores } from '../../theme';

/**
 * Área online — ainda por construir.
 *
 * O fluxo do protótipo começa com "Permitir e fazer login com Google": visitar
 * o pigreen de um amigo é leitura de dados de *outra* conta, o que exige um
 * provedor OAuth configurado no console do Firebase e regras de segurança
 * entre contas. Enquanto essa decisão não estiver tomada, a tela diz
 * honestamente o que vem em vez de fingir uma lista de amigos vazia.
 */
export default function AreaOnline() {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  return (
    <SafeAreaView style={estilos.container}>
      <View style={estilos.conteudo}>
        <MaterialCommunityIcons name="hammer-wrench" size={44} color={cores.primaria} />
        <Texto variante="titulo" centralizado>
          {t('online.titulo')}
        </Texto>
        <Texto variante="corpo" centralizado cor={cores.textoSecundario}>
          {t('online.descricao')}
        </Texto>
      </View>
    </SafeAreaView>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: cores.fundo },
    conteudo: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: espacos.sm,
      paddingHorizontal: espacos.xl,
      paddingBottom: 96,
    },
  });
