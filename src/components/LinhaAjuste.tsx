import React, { ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Texto } from './Texto';
import { alvoToque, espacos, raios, useTema } from '../theme';
import type { Cores } from '../theme';

type NomeIcone = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface PropsGrupo {
  titulo: string;
  children: ReactNode;
}

/** Bloco de opções com um rótulo de seção acima. */
export function GrupoAjustes({ titulo, children }: PropsGrupo) {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  return (
    <View style={estilos.grupo}>
      <Texto variante="micro" cor={cores.textoSecundario} style={estilos.tituloGrupo}>
        {titulo.toUpperCase()}
      </Texto>
      <View style={estilos.cartao}>{children}</View>
    </View>
  );
}

interface PropsLinha {
  icone: NomeIcone;
  titulo: string;
  descricao?: string;
  /** Texto à direita, como o idioma escolhido. */
  valor?: string;
  onPress?: () => void;
  /** Transforma a linha num interruptor em vez de um destino. */
  interruptor?: { ativo: boolean; aoMudar: (ativo: boolean) => void };
  destrutiva?: boolean;
  ultima?: boolean;
}

/**
 * Uma linha da lista de ajustes.
 *
 * O mesmo componente serve para navegar, alternar um interruptor e disparar
 * uma ação destrutiva — três aparências de um único padrão, o que mantém
 * altura, alinhamento de ícone e separador iguais em toda a tela.
 */
export function LinhaAjuste({
  icone,
  titulo,
  descricao,
  valor,
  onPress,
  interruptor,
  destrutiva = false,
  ultima = false,
}: PropsLinha) {
  const { cores } = useTema();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);
  const corPrincipal = destrutiva ? cores.erro : cores.texto;

  const conteudo = (
    <View style={[estilos.linha, !ultima && estilos.comSeparador]}>
      <View style={[estilos.icone, destrutiva && estilos.iconeDestrutivo]}>
        <MaterialCommunityIcons name={icone} size={20} color={corPrincipal} />
      </View>

      <View style={estilos.textos}>
        <Texto variante="corpoForte" cor={corPrincipal}>
          {titulo}
        </Texto>
        {descricao && (
          <Texto variante="legenda" cor={cores.textoSecundario}>
            {descricao}
          </Texto>
        )}
      </View>

      {interruptor ? (
        <Switch
          value={interruptor.ativo}
          onValueChange={interruptor.aoMudar}
          trackColor={{ false: cores.bordaSutil, true: cores.primariaSuave }}
          thumbColor={interruptor.ativo ? cores.primaria : cores.fundoElevado}
          accessibilityLabel={titulo}
        />
      ) : (
        <View style={estilos.direita}>
          {valor && (
            <Texto variante="legenda" cor={cores.textoSecundario}>
              {valor}
            </Texto>
          )}
          {onPress && <Feather name="chevron-right" size={20} color={cores.textoDesabilitado} />}
        </View>
      )}
    </View>
  );

  if (!onPress) return conteudo;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={descricao ? `${titulo}. ${descricao}` : titulo}
      style={({ pressed }) => (pressed ? estilos.pressionada : undefined)}
    >
      {conteudo}
    </Pressable>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    grupo: { marginBottom: espacos.lg },
    tituloGrupo: { marginBottom: espacos.xs, marginLeft: espacos.xs },
    cartao: {
      backgroundColor: cores.fundoElevado,
      borderRadius: raios.medio,
      overflow: 'hidden',
    },
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espacos.sm,
      minHeight: alvoToque + 8,
      paddingHorizontal: espacos.sm,
      paddingVertical: espacos.xs,
    },
    comSeparador: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: cores.bordaSutil,
    },
    icone: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cores.primariaSutil,
    },
    iconeDestrutivo: { backgroundColor: cores.transparente },
    textos: { flex: 1, gap: 1 },
    direita: { flexDirection: 'row', alignItems: 'center', gap: espacos.xxs },
    pressionada: { opacity: 0.6 },
  });
