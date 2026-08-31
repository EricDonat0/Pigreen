import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TelaBase } from '../../components/TelaBase';
import { Texto } from '../../components/Texto';
import { CampoTexto } from '../../components/CampoTexto';
import { CampoData } from '../../components/CampoData';
import { BotaoPrimario } from '../../components/BotaoPrimario';
import { SeletorDieta } from '../auth/Cadastro';
import { useAutenticacao } from '../../contexts/AutenticacaoContext';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { chaveDeErro } from '../../services/erros';
import { deIsoCurto, paraIsoCurto, validarNascimento } from '../../domain/validacao';
import { espacos, useTema } from '../../theme';
import type { ChaveTraducao } from '../../i18n';
import type { PerfilDieta } from '../../types';
import type { RotasAjustes } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAjustes, 'EditarPerfil'>;

/**
 * Edição dos dados cadastrais.
 *
 * O e-mail fica de fora: trocá-lo significa mexer na credencial de acesso, o
 * que exige reautenticação e verificação do novo endereço — um fluxo próprio,
 * não um campo de formulário.
 */
export default function EditarPerfil({ navigation }: Props) {
  const { usuario, atualizarPerfil } = useAutenticacao();
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(), []);

  const [nomeResponsavel, setNomeResponsavel] = useState(usuario?.nomeResponsavel ?? '');
  const [nomeCrianca, setNomeCrianca] = useState(usuario?.nomeCrianca ?? '');
  const [nascimento, setNascimento] = useState<Date | null>(
    usuario ? deIsoCurto(usuario.nascimentoCrianca) : null,
  );
  const [dieta, setDieta] = useState<PerfilDieta | null>(usuario?.dieta ?? null);

  const [erros, setErros] = useState<Partial<Record<string, ChaveTraducao>>>({});
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const salvar = useCallback(async () => {
    setErroServidor(null);

    const novos: Partial<Record<string, ChaveTraducao>> = {};
    if (nomeResponsavel.trim().length < 2) novos.nomeResponsavel = 'validacao.nomeResponsavel';
    if (nomeCrianca.trim().length < 2) novos.nomeCrianca = 'validacao.nomeCrianca';
    Object.assign(novos, validarNascimento(nascimento));
    if (!dieta) novos.dieta = 'validacao.dieta';

    setErros(novos);
    if (Object.keys(novos).length > 0 || !nascimento || !dieta) return;

    setSalvando(true);
    try {
      await atualizarPerfil({
        nomeResponsavel: nomeResponsavel.trim(),
        nomeCrianca: nomeCrianca.trim(),
        nascimentoCrianca: paraIsoCurto(nascimento),
        dieta,
      });
      navigation.goBack();
    } catch (e) {
      setErroServidor(t(chaveDeErro(e)));
      setSalvando(false);
    }
  }, [nomeResponsavel, nomeCrianca, nascimento, dieta, atualizarPerfil, navigation, t]);

  return (
    <TelaBase
      titulo={t('perfil.titulo')}
      aoVoltar={() => navigation.goBack()}
      rodape={
        <BotaoPrimario titulo={t('comum.salvar')} onPress={() => void salvar()} carregando={salvando} />
      }
    >
      <View style={estilos.aviso}>
        <Texto variante="legenda" cor={cores.textoSecundario}>
          {t('perfil.emailFixo')}
        </Texto>
        <Texto variante="corpoForte">{usuario?.email}</Texto>
      </View>

      <CampoTexto
        rotulo={t('cadastro.nomeResponsavel')}
        valor={nomeResponsavel}
        aoMudar={setNomeResponsavel}
        erro={erros.nomeResponsavel && t(erros.nomeResponsavel)}
        autoCapitalize="words"
      />
      <CampoTexto
        rotulo={t('cadastro.nomeCrianca')}
        valor={nomeCrianca}
        aoMudar={setNomeCrianca}
        erro={erros.nomeCrianca && t(erros.nomeCrianca)}
        autoCapitalize="words"
      />
      <CampoData
        rotulo={t('cadastro.nascimento')}
        valor={nascimento}
        aoMudar={setNascimento}
        erro={erros.nascimentoCrianca && t(erros.nascimentoCrianca)}
      />
      <SeletorDieta
        valor={dieta}
        aoMudar={setDieta}
        erro={erros.dieta && t(erros.dieta)}
      />

      {erroServidor && (
        <Texto variante="legenda" cor={cores.erro} centralizado accessibilityLiveRegion="polite">
          {erroServidor}
        </Texto>
      )}
    </TelaBase>
  );
}

const criarEstilos = () =>
  StyleSheet.create({
    aviso: { marginBottom: espacos.lg, gap: 2 },
  });
