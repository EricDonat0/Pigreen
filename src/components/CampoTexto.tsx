import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Texto } from './Texto';
import { espacos, textos, useTema } from '../theme';
import type { Cores } from '../theme';
import { useTraducao } from '../contexts/PreferenciasContext';

interface Props extends Omit<TextInputProps, 'style'> {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  obrigatorio?: boolean;
  erro?: string | null;
  /** Adiciona o botão de olho para revelar a senha. */
  senha?: boolean;
  /** Texto de apoio abaixo do campo (força da senha, dica de formato). */
  auxiliar?: { texto: string; cor?: string } | null;
  /** Estilo do contêiner do campo — nunca do `TextInput`, que é interno. */
  style?: ViewStyle;
}

/**
 * Campo de texto no padrão do Figma: sem caixa, apenas uma linha inferior, com
 * o rótulo funcionando como placeholder e um asterisco quando obrigatório.
 *
 * O rótulo é um `Text` sobreposto em vez do `placeholder` nativo porque o
 * asterisco precisa de cor própria — e porque assim ele continua sendo lido
 * por leitores de tela mesmo com o campo preenchido, via `accessibilityLabel`.
 */
export function CampoTexto({
  rotulo,
  valor,
  aoMudar,
  obrigatorio = false,
  erro = null,
  senha = false,
  auxiliar = null,
  style,
  ...resto
}: Props) {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);
  const [revelada, setRevelada] = useState(false);
  const vazio = valor.length === 0;

  return (
    <View style={[estilos.wrapper, style]}>
      <View style={[estilos.linha, erro ? estilos.linhaErro : null]}>
        {vazio && (
          <View style={estilos.placeholder} pointerEvents="none">
            <Texto variante="corpo">{rotulo}</Texto>
            {obrigatorio && (
              <Texto variante="corpo" cor={cores.erro} style={estilos.asterisco}>
                *
              </Texto>
            )}
          </View>
        )}

        <TextInput
          value={valor}
          onChangeText={aoMudar}
          secureTextEntry={senha && !revelada}
          autoCapitalize="none"
          autoCorrect={false}
          cursorColor={cores.texto}
          selectionColor={cores.primaria}
          placeholderTextColor={cores.textoDesabilitado}
          maxFontSizeMultiplier={1.4}
          accessibilityLabel={obrigatorio ? `${rotulo} *` : rotulo}
          style={estilos.input}
          {...resto}
        />

        {senha && (
          <Pressable
            onPress={() => setRevelada((v) => !v)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={revelada ? t('comum.fechar') : t('login.senha')}
            style={estilos.olho}
          >
            <Feather name={revelada ? 'eye' : 'eye-off'} size={20} color={cores.texto} />
          </Pressable>
        )}
      </View>

      {erro ? (
        <Texto
          variante="legenda"
          cor={cores.erro}
          style={estilos.apoio}
          accessibilityLiveRegion="polite"
        >
          {erro}
        </Texto>
      ) : auxiliar ? (
        <Texto
          variante="legenda"
          cor={auxiliar.cor ?? cores.textoSecundario}
          style={estilos.apoio}
        >
          {auxiliar.texto}
        </Texto>
      ) : null}
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    wrapper: { width: '100%', marginBottom: espacos.md },
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1.2,
      borderBottomColor: cores.borda,
    },
    linhaErro: { borderBottomColor: cores.erro },
    placeholder: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      bottom: 6,
      left: 0,
    },
    asterisco: { marginLeft: espacos.xxs },
    input: {
      flex: 1,
      paddingVertical: espacos.xs,
      ...textos.corpo,
      color: cores.texto,
    },
    olho: { padding: espacos.xxs },
    apoio: { marginTop: espacos.xxs },
  });
