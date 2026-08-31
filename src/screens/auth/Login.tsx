import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Texto } from '../../components/Texto';
import { CampoTexto } from '../../components/CampoTexto';
import { BotaoPrimario } from '../../components/BotaoPrimario';
import { useAutenticacao } from '../../contexts/AutenticacaoContext';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { chaveDeErro } from '../../services/erros';
import { emailValido } from '../../domain/validacao';
import { useValorAnimado } from '../../hooks/useValorAnimado';
import { IMAGENS } from '../../assets/registro';
import { espacos, raios, sombras, useTema } from '../../theme';
import type { Cores } from '../../theme';
import type { RotasAutenticacao } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAutenticacao, 'Login'>;

const { height } = Dimensions.get('window');

export default function Login({ navigation }: Props) {
  const { entrar } = useAutenticacao();
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const deslize = useValorAnimado(height);

  useEffect(() => {
    Animated.timing(deslize, { toValue: 0, duration: 650, useNativeDriver: true }).start();
  }, [deslize]);

  const submeter = useCallback(async () => {
    setErro(null);

    if (!emailValido(email)) {
      setErro(t('login.emailInvalido'));
      return;
    }
    if (senha.length === 0) {
      setErro(t('login.senhaVazia'));
      return;
    }

    setEnviando(true);
    try {
      await entrar(email, senha);
      // A troca de tela é feita pelo RootNavigator ao observar a sessão —
      // esta tela simplesmente desmonta.
    } catch (e) {
      setErro(t(chaveDeErro(e)));
      setEnviando(false);
    }
  }, [email, senha, entrar, t]);

  return (
    <ImageBackground source={IMAGENS.tijolosLogin} style={estilos.fundo} resizeMode="cover">
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[estilos.sheet, { transform: [{ translateY: deslize }] }]}>
          <ScrollView
            contentContainerStyle={estilos.conteudo}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Texto variante="display" centralizado style={estilos.titulo}>
              {t('login.titulo')}
            </Texto>

            <CampoTexto
              rotulo={t('login.email')}
              valor={email}
              aoMudar={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
            />

            <CampoTexto
              rotulo={t('login.senha')}
              valor={senha}
              aoMudar={setSenha}
              senha
              textContentType="password"
              autoComplete="current-password"
              returnKeyType="go"
              onSubmitEditing={() => void submeter()}
            />

            <Pressable
              onPress={() => navigation.navigate('EsqueciSenha', { email })}
              hitSlop={8}
              accessibilityRole="button"
              style={estilos.esqueci}
            >
              <Texto variante="legenda" cor={cores.textoSecundario}>
                {t('login.esqueci')}
              </Texto>
            </Pressable>

            {erro && (
              <Texto
                variante="legenda"
                cor={cores.erro}
                centralizado
                accessibilityLiveRegion="polite"
                style={estilos.erro}
              >
                {erro}
              </Texto>
            )}

            <BotaoPrimario
              titulo={t('login.entrar')}
              onPress={() => void submeter()}
              carregando={enviando}
              style={estilos.botao}
            />
          </ScrollView>

          <Pressable
            onPress={() => navigation.navigate('Cadastro')}
            style={estilos.cadastro}
            accessibilityRole="button"
          >
            <Texto variante="corpoForte">{t('login.semCadastro')}</Texto>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: cores.terraEscura },
    flex: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
      height: '72%',
      backgroundColor: cores.fundo,
      borderTopLeftRadius: raios.sheet,
      borderTopRightRadius: raios.sheet,
      paddingHorizontal: espacos.xl,
      paddingTop: espacos.xxl,
      ...sombras.sheet,
    },
    conteudo: { paddingBottom: espacos.xxl },
    titulo: { marginBottom: espacos.xl },
    esqueci: { alignSelf: 'flex-end', marginTop: -espacos.xs },
    erro: { marginTop: espacos.sm },
    botao: { marginTop: espacos.lg },
    cadastro: { alignSelf: 'center', paddingVertical: espacos.lg },
  });
