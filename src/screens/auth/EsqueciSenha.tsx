import React, { useCallback, useMemo, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Texto } from '../../components/Texto';
import { CampoTexto } from '../../components/CampoTexto';
import { BotaoPrimario } from '../../components/BotaoPrimario';
import { useAutenticacao } from '../../contexts/AutenticacaoContext';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { chaveDeErro, codigoDoErro } from '../../services/erros';
import { emailValido } from '../../domain/validacao';
import { IMAGENS } from '../../assets/registro';
import { alvoToque, espacos, raios, sombras, useTema } from '../../theme';
import type { Cores } from '../../theme';
import type { RotasAutenticacao } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAutenticacao, 'EsqueciSenha'>;

/**
 * Recuperação de senha via e-mail do Firebase.
 *
 * A tela confirma o envio mesmo quando o e-mail não existe: dizer "essa conta
 * não existe" transformaria o formulário num verificador de contas cadastradas.
 */
export default function EsqueciSenha({ navigation, route }: Props) {
  const { recuperarSenha } = useAutenticacao();
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const [email, setEmail] = useState(route.params?.email ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const submeter = useCallback(async () => {
    setErro(null);
    if (!emailValido(email)) {
      setErro(t('login.emailInvalido'));
      return;
    }

    setEnviando(true);
    try {
      await recuperarSenha(email);
      setEnviado(true);
    } catch (e) {
      // "Usuário não encontrado" também vira confirmação, pelo mesmo motivo.
      if (codigoDoErro(e) === 'auth/user-not-found') setEnviado(true);
      else setErro(t(chaveDeErro(e)));
    } finally {
      setEnviando(false);
    }
  }, [email, recuperarSenha, t]);

  return (
    <ImageBackground source={IMAGENS.tijolosLogin} style={estilos.fundo} resizeMode="cover">
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={estilos.sheet}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={estilos.voltar}
            accessibilityRole="button"
            accessibilityLabel={t('comum.voltar')}
          >
            <Feather name="arrow-left" size={24} color={cores.texto} />
          </Pressable>

          <ScrollView
            contentContainerStyle={estilos.conteudo}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {enviado ? (
              <View style={estilos.sucesso}>
                <View style={estilos.circulo}>
                  <Feather name="check" size={36} color={cores.texto} />
                </View>
                <Texto variante="displayPequeno" centralizado>
                  {t('recuperacao.enviadoTitulo')}
                </Texto>
                <Texto variante="corpo" centralizado cor={cores.textoSecundario}>
                  {t('recuperacao.enviadoTexto', { email: email.trim() })}
                </Texto>
                <BotaoPrimario
                  titulo={t('recuperacao.voltarLogin')}
                  onPress={() => navigation.navigate('Login')}
                  style={estilos.botao}
                />
              </View>
            ) : (
              <>
                <Texto variante="titulo" centralizado style={estilos.titulo}>
                  {t('recuperacao.titulo')}
                </Texto>
                <Texto variante="corpo" centralizado cor={cores.textoSecundario}>
                  {t('recuperacao.descricao')}
                </Texto>

                <CampoTexto
                  rotulo={t('login.email')}
                  valor={email}
                  aoMudar={setEmail}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="send"
                  onSubmitEditing={() => void submeter()}
                  erro={erro}
                  style={estilos.campo}
                />

                <BotaoPrimario
                  titulo={t('recuperacao.avancar')}
                  onPress={() => void submeter()}
                  carregando={enviando}
                  style={estilos.botao}
                />
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: cores.terraEscura },
    flex: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
      height: '68%',
      backgroundColor: cores.fundo,
      borderTopLeftRadius: raios.sheet,
      borderTopRightRadius: raios.sheet,
      ...sombras.sheet,
    },
    voltar: {
      position: 'absolute',
      top: espacos.md,
      left: espacos.md,
      width: alvoToque,
      height: alvoToque,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
    },
    conteudo: {
      paddingHorizontal: espacos.xl,
      paddingTop: espacos.xxl,
      paddingBottom: espacos.xl,
    },
    titulo: { marginBottom: espacos.xs },
    campo: { marginTop: espacos.xl },
    botao: { marginTop: espacos.lg },
    sucesso: { alignItems: 'center', gap: espacos.sm, paddingTop: espacos.lg },
    circulo: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 2,
      borderColor: cores.borda,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: espacos.xs,
    },
  });
