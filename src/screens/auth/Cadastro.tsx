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
import { CampoData } from '../../components/CampoData';
import { BotaoPrimario } from '../../components/BotaoPrimario';
import { useAutenticacao } from '../../contexts/AutenticacaoContext';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { chaveDeErro } from '../../services/erros';
import {
  ErrosCadastro,
  FormularioCadastro,
  avaliarSenha,
  paraIsoCurto,
  semErros,
  validarCadastro,
} from '../../domain/validacao';
import { IMAGENS } from '../../assets/registro';
import { alvoToque, espacos, raios, sombras, useTema } from '../../theme';
import type { Cores } from '../../theme';
import type { ChaveTraducao } from '../../i18n';
import type { PerfilDieta } from '../../types';
import type { RotasAutenticacao } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAutenticacao, 'Cadastro'>;

export const OPCOES_DIETA: { valor: PerfilDieta; chave: ChaveTraducao }[] = [
  { valor: 'vegano', chave: 'cadastro.vegano' },
  { valor: 'vegetariano', chave: 'cadastro.vegetariano' },
  { valor: 'transicao', chave: 'cadastro.transicao' },
];

const FORM_VAZIO: FormularioCadastro = {
  nomeResponsavel: '',
  nomeCrianca: '',
  email: '',
  confirmacaoEmail: '',
  senha: '',
  confirmacaoSenha: '',
  nascimentoCrianca: null,
  dieta: null,
};

export default function Cadastro({ navigation }: Props) {
  const { cadastrar } = useAutenticacao();
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const [form, setForm] = useState<FormularioCadastro>(FORM_VAZIO);
  const [errosVisiveis, setErrosVisiveis] = useState<ErrosCadastro>({});
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const atualizar = useCallback(
    <C extends keyof FormularioCadastro>(campo: C, valor: FormularioCadastro[C]) => {
      setForm((atual) => ({ ...atual, [campo]: valor }));
      // Some com o erro do campo assim que o usuário mexe nele; mostrar o erro
      // de novo é trabalho do próximo envio.
      setErrosVisiveis((atual) => {
        if (!(campo in atual)) return atual;
        const { [campo]: _, ...resto } = atual;
        return resto;
      });
    },
    [],
  );

  const forcaSenha = useMemo(() => (form.senha ? avaliarSenha(form.senha) : null), [form.senha]);

  const coresForca = {
    fraca: cores.erro,
    media: cores.alerta,
    forte: cores.sucesso,
  } as const;

  const submeter = useCallback(async () => {
    setErroServidor(null);

    const erros = validarCadastro(form);
    setErrosVisiveis(erros);
    if (!semErros(erros) || !form.nascimentoCrianca || !form.dieta) return;

    setEnviando(true);
    try {
      await cadastrar(
        {
          nomeResponsavel: form.nomeResponsavel.trim(),
          nomeCrianca: form.nomeCrianca.trim(),
          email: form.email,
          nascimentoCrianca: paraIsoCurto(form.nascimentoCrianca),
          dieta: form.dieta,
        },
        form.senha,
      );
      // O cadastro já deixa a sessão iniciada: o RootNavigator leva direto ao
      // jogo, sem pedir que o responsável digite tudo de novo no login.
    } catch (e) {
      setErroServidor(t(chaveDeErro(e)));
      setEnviando(false);
    }
  }, [form, cadastrar, t]);

  return (
    <ImageBackground source={IMAGENS.tijolos} style={estilos.fundo} resizeMode="cover">
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={estilos.sheet}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={estilos.fechar}
            accessibilityRole="button"
            accessibilityLabel={t('comum.voltar')}
          >
            <Feather name="x" size={24} color={cores.textoDesabilitado} />
          </Pressable>

          <ScrollView
            contentContainerStyle={estilos.conteudo}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Texto variante="titulo" centralizado style={estilos.titulo}>
              {t('cadastro.titulo')}
            </Texto>

            <CampoTexto
              rotulo={t('cadastro.nomeResponsavel')}
              valor={form.nomeResponsavel}
              aoMudar={(v) => atualizar('nomeResponsavel', v)}
              erro={errosVisiveis.nomeResponsavel && t(errosVisiveis.nomeResponsavel)}
              obrigatorio
              autoCapitalize="words"
              textContentType="name"
            />
            <CampoTexto
              rotulo={t('cadastro.nomeCrianca')}
              valor={form.nomeCrianca}
              aoMudar={(v) => atualizar('nomeCrianca', v)}
              erro={errosVisiveis.nomeCrianca && t(errosVisiveis.nomeCrianca)}
              obrigatorio
              autoCapitalize="words"
            />
            <CampoTexto
              rotulo={t('cadastro.email')}
              valor={form.email}
              aoMudar={(v) => atualizar('email', v)}
              erro={errosVisiveis.email && t(errosVisiveis.email)}
              obrigatorio
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <CampoTexto
              rotulo={t('cadastro.confirmacaoEmail')}
              valor={form.confirmacaoEmail}
              aoMudar={(v) => atualizar('confirmacaoEmail', v)}
              erro={errosVisiveis.confirmacaoEmail && t(errosVisiveis.confirmacaoEmail)}
              obrigatorio
              keyboardType="email-address"
            />
            <CampoTexto
              rotulo={t('cadastro.senha')}
              valor={form.senha}
              aoMudar={(v) => atualizar('senha', v)}
              erro={errosVisiveis.senha && t(errosVisiveis.senha)}
              obrigatorio
              senha
              textContentType="newPassword"
              auxiliar={
                forcaSenha
                  ? { texto: t(forcaSenha.chaveRotulo), cor: coresForca[forcaSenha.forca] }
                  : null
              }
            />
            <CampoTexto
              rotulo={t('cadastro.confirmacaoSenha')}
              valor={form.confirmacaoSenha}
              aoMudar={(v) => atualizar('confirmacaoSenha', v)}
              erro={errosVisiveis.confirmacaoSenha && t(errosVisiveis.confirmacaoSenha)}
              obrigatorio
              senha
            />

            <CampoData
              rotulo={t('cadastro.nascimento')}
              valor={form.nascimentoCrianca}
              aoMudar={(d) => atualizar('nascimentoCrianca', d)}
              erro={errosVisiveis.nascimentoCrianca && t(errosVisiveis.nascimentoCrianca)}
            />

            <SeletorDieta
              valor={form.dieta}
              aoMudar={(d) => atualizar('dieta', d)}
              erro={errosVisiveis.dieta && t(errosVisiveis.dieta)}
            />

            {erroServidor && (
              <Texto
                variante="legenda"
                cor={cores.erro}
                centralizado
                accessibilityLiveRegion="polite"
                style={estilos.erroServidor}
              >
                {erroServidor}
              </Texto>
            )}

            <BotaoPrimario
              titulo={t('cadastro.enviar')}
              onPress={() => void submeter()}
              carregando={enviando}
              style={estilos.botao}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

/**
 * Grupo de rádio do perfil alimentar. Extraído para ser reaproveitado pela
 * tela de edição de perfil, que faz exatamente a mesma pergunta.
 */
export function SeletorDieta({
  valor,
  aoMudar,
  erro,
}: {
  valor: PerfilDieta | null;
  aoMudar: (dieta: PerfilDieta) => void;
  erro?: string | null;
}) {
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  return (
    <View
      style={estilos.grupoRadio}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('cadastro.perfilAlimentar')}
    >
      <Texto variante="corpo" style={estilos.rotuloGrupo}>
        {t('cadastro.assinaleUm')}
      </Texto>

      {OPCOES_DIETA.map((opcao) => {
        const selecionada = valor === opcao.valor;
        const rotulo = t(opcao.chave);
        return (
          <Pressable
            key={opcao.valor}
            onPress={() => aoMudar(opcao.valor)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selecionada, checked: selecionada }}
            accessibilityLabel={rotulo}
            style={estilos.opcao}
          >
            <View style={estilos.radio}>{selecionada && <View style={estilos.radioMiolo} />}</View>
            <Texto variante="corpo">{rotulo}</Texto>
          </Pressable>
        );
      })}

      {erro ? (
        <Texto variante="legenda" cor={cores.erro}>
          {erro}
        </Texto>
      ) : null}
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: cores.terraEscura },
    flex: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
      // Sem `flex: 1`: a folha ocupa a maior parte da tela e deixa os tijolos
      // aparecendo só no topo, sem revelar a tela anterior por baixo.
      height: '90%',
      backgroundColor: cores.fundo,
      borderTopLeftRadius: raios.sheet,
      borderTopRightRadius: raios.sheet,
      ...sombras.sheet,
    },
    fechar: {
      position: 'absolute',
      top: espacos.md,
      right: espacos.md,
      width: alvoToque,
      height: alvoToque,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
    },
    conteudo: {
      paddingHorizontal: espacos.xl,
      paddingTop: espacos.xxl,
      paddingBottom: espacos.xxl,
    },
    titulo: { marginBottom: espacos.lg },
    grupoRadio: { marginBottom: espacos.lg, gap: espacos.xs },
    rotuloGrupo: { marginBottom: espacos.xxs },
    opcao: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm, minHeight: 36 },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: cores.primaria,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioMiolo: { width: 10, height: 10, borderRadius: 5, backgroundColor: cores.primaria },
    erroServidor: { marginBottom: espacos.sm },
    botao: { marginTop: espacos.xs },
  });
