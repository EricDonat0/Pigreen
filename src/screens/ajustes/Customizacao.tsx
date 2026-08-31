import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TelaBase } from '../../components/TelaBase';
import { Texto } from '../../components/Texto';
import { Porquinho } from '../../components/jogo/Porquinho';
import { usePet } from '../../contexts/PetContext';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { ITENS, alternarItem, itemLiberado } from '../../domain/itens';
import { espacos, raios, useTema } from '../../theme';
import type { Cores } from '../../theme';
import type { RotasAjustes } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAjustes, 'Customizacao'>;

/**
 * Vitrine de acessórios.
 *
 * A escolha é aplicada na hora, sem botão de salvar: o pet no topo da tela é a
 * confirmação, e desfazer é tocar de novo no mesmo item. Um formulário aqui
 * seria uma etapa a mais entre a criança e o resultado que ela quer ver.
 */
export default function Customizacao({ navigation }: Props) {
  const { pet, estado, equiparItens } = usePet();
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const [salvando, setSalvando] = useState<string | null>(null);
  // `useMemo` mantém a identidade estável entre renderizações: sem isso o
  // array novo a cada render invalidaria o `useCallback` abaixo.
  const equipados = useMemo(() => pet?.itensEquipados ?? [], [pet?.itensEquipados]);
  const nivel = pet?.nivel ?? 1;

  const alternar = useCallback(
    async (id: string) => {
      setSalvando(id);
      await equiparItens(alternarItem(equipados, id));
      setSalvando(null);
    },
    [equipados, equiparItens],
  );

  return (
    <TelaBase titulo={t('customizacao.titulo')} aoVoltar={() => navigation.goBack()}>
      <View style={estilos.palco}>
        <Porquinho
          estado={estado}
          nome={pet?.nome ?? ''}
          tamanho={170}
          itens={equipados}
        />
      </View>

      <View style={estilos.grade}>
        {ITENS.map((item) => {
          const liberado = itemLiberado(item, nivel);
          const vestido = equipados.includes(item.id);
          const nome = t(item.chaveNome);

          return (
            <Pressable
              key={item.id}
              onPress={() => void alternar(item.id)}
              disabled={!liberado || salvando != null}
              accessibilityRole="button"
              accessibilityState={{ selected: vestido, disabled: !liberado }}
              accessibilityLabel={
                liberado ? nome : `${nome}. ${t('customizacao.bloqueado', { nivel: item.nivelMinimo })}`
              }
              style={({ pressed }) => [
                estilos.card,
                vestido && estilos.cardVestido,
                !liberado && estilos.cardBloqueado,
                pressed && liberado && estilos.pressionado,
              ]}
            >
              <View style={estilos.moldura}>
                {liberado ? (
                  <Texto style={estilos.emoji}>{item.emoji}</Texto>
                ) : (
                  <MaterialCommunityIcons name="lock" size={26} color={cores.textoDesabilitado} />
                )}
              </View>

              <Texto
                variante="micro"
                centralizado
                cor={liberado ? cores.texto : cores.textoDesabilitado}
              >
                {liberado ? nome : t('customizacao.bloqueado', { nivel: item.nivelMinimo })}
              </Texto>

              {liberado && (
                <Texto variante="micro" centralizado cor={cores.primaria}>
                  {vestido ? t('customizacao.tirar') : t('customizacao.vestir')}
                </Texto>
              )}
            </Pressable>
          );
        })}
      </View>
    </TelaBase>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    palco: {
      alignItems: 'center',
      paddingVertical: espacos.md,
      backgroundColor: cores.fundoAfundado,
      borderRadius: raios.grande,
      marginBottom: espacos.lg,
    },
    grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.sm },
    card: {
      width: '30%',
      minWidth: 96,
      flexGrow: 1,
      alignItems: 'center',
      gap: espacos.xxs,
      paddingVertical: espacos.sm,
      borderRadius: raios.medio,
      backgroundColor: cores.fundoElevado,
      borderWidth: 2,
      borderColor: cores.transparente,
    },
    cardVestido: { borderColor: cores.primaria },
    cardBloqueado: { opacity: 0.55 },
    pressionado: { transform: [{ scale: 0.96 }] },
    moldura: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cores.primariaSutil,
    },
    emoji: { fontSize: 30, lineHeight: 36 },
  });
