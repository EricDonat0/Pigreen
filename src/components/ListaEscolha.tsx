import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Texto } from './Texto';
import { alvoToque, espacos, raios, useTema } from '../theme';
import type { Cores } from '../theme';

export interface Escolha<T extends string> {
  valor: T;
  rotulo: string;
  descricao?: string;
}

interface Props<T extends string> {
  opcoes: readonly Escolha<T>[];
  selecionado: T;
  aoEscolher: (valor: T) => void;
  rotuloGrupo: string;
}

/**
 * Lista de escolha única, com marca de seleção.
 *
 * Usa `radio` em vez de `button` como papel de acessibilidade para que o leitor
 * de tela anuncie "1 de 3, selecionado" — informação que um botão simples não
 * transmite.
 */
export function ListaEscolha<T extends string>({
  opcoes,
  selecionado,
  aoEscolher,
  rotuloGrupo,
}: Props<T>) {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  return (
    <View style={estilos.cartao} accessibilityRole="radiogroup" accessibilityLabel={rotuloGrupo}>
      {opcoes.map((opcao, indice) => {
        const ativa = opcao.valor === selecionado;
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => aoEscolher(opcao.valor)}
            accessibilityRole="radio"
            accessibilityState={{ selected: ativa, checked: ativa }}
            accessibilityLabel={opcao.rotulo}
            style={({ pressed }) => [
              estilos.linha,
              indice < opcoes.length - 1 && estilos.comSeparador,
              pressed && estilos.pressionada,
            ]}
          >
            <View style={estilos.textos}>
              <Texto variante="corpoForte">{opcao.rotulo}</Texto>
              {opcao.descricao && (
                <Texto variante="legenda" cor={cores.textoSecundario}>
                  {opcao.descricao}
                </Texto>
              )}
            </View>

            {ativa && <Feather name="check" size={20} color={cores.primaria} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    cartao: {
      backgroundColor: cores.fundoElevado,
      borderRadius: raios.medio,
      overflow: 'hidden',
    },
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espacos.sm,
      minHeight: alvoToque,
      paddingHorizontal: espacos.md,
      paddingVertical: espacos.sm,
    },
    comSeparador: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: cores.bordaSutil,
    },
    textos: { flex: 1, gap: 1 },
    pressionada: { opacity: 0.6 },
  });
