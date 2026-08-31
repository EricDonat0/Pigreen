import React, { useCallback, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TelaBase } from '../../components/TelaBase';
import { Texto } from '../../components/Texto';
import { CampoTexto } from '../../components/CampoTexto';
import { BotaoPrimario } from '../../components/BotaoPrimario';
import { useAutenticacao } from '../../contexts/AutenticacaoContext';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { chaveDeErro } from '../../services/erros';
import { avaliarSenha } from '../../domain/validacao';
import { espacos, useTema } from '../../theme';
import type { ChaveTraducao } from '../../i18n';
import type { RotasAjustes } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAjustes, 'AlterarSenha'>;

export default function AlterarSenha({ navigation }: Props) {
  const { alterarSenha } = useAutenticacao();
  const { cores } = useTema();
  const t = useTraducao();

  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<Partial<Record<string, ChaveTraducao>>>({});
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const forca = useMemo(() => (nova ? avaliarSenha(nova) : null), [nova]);
  const coresForca = { fraca: cores.erro, media: cores.alerta, forte: cores.sucesso } as const;

  const submeter = useCallback(async () => {
    setErroServidor(null);
    setSucesso(false);

    const novos: Partial<Record<string, ChaveTraducao>> = {};
    if (atual.length === 0) novos.atual = 'erro.auth/missing-password';

    const avaliacao = avaliarSenha(nova);
    if (!avaliacao.aceitavel) novos.nova = avaliacao.chaveRotulo;
    else if (nova !== confirmacao) novos.confirmacao = 'validacao.senhaDiferente';
    else if (nova === atual) novos.nova = 'senha.igualAtual';

    setErros(novos);
    if (Object.keys(novos).length > 0) return;

    setSalvando(true);
    try {
      await alterarSenha(atual, nova);
      setSucesso(true);
      setAtual('');
      setNova('');
      setConfirmacao('');
    } catch (e) {
      setErroServidor(t(chaveDeErro(e)));
    } finally {
      setSalvando(false);
    }
  }, [atual, nova, confirmacao, alterarSenha, t]);

  return (
    <TelaBase
      titulo={t('senha.titulo')}
      aoVoltar={() => navigation.goBack()}
      rodape={
        <BotaoPrimario
          titulo={t('senha.enviar')}
          onPress={() => void submeter()}
          carregando={salvando}
        />
      }
    >
      <CampoTexto
        rotulo={t('senha.atual')}
        valor={atual}
        aoMudar={setAtual}
        senha
        textContentType="password"
        erro={erros.atual && t(erros.atual)}
      />
      <CampoTexto
        rotulo={t('senha.nova')}
        valor={nova}
        aoMudar={setNova}
        senha
        textContentType="newPassword"
        erro={erros.nova && t(erros.nova)}
        auxiliar={forca ? { texto: t(forca.chaveRotulo), cor: coresForca[forca.forca] } : null}
      />
      <CampoTexto
        rotulo={t('senha.confirmar')}
        valor={confirmacao}
        aoMudar={setConfirmacao}
        senha
        erro={erros.confirmacao && t(erros.confirmacao)}
      />

      {sucesso && (
        <Texto
          variante="corpoForte"
          cor={cores.sucesso}
          centralizado
          accessibilityLiveRegion="polite"
          style={{ marginTop: espacos.md }}
        >
          {t('senha.sucesso')}
        </Texto>
      )}

      {erroServidor && (
        <Texto
          variante="legenda"
          cor={cores.erro}
          centralizado
          accessibilityLiveRegion="polite"
          style={{ marginTop: espacos.md }}
        >
          {erroServidor}
        </Texto>
      )}
    </TelaBase>
  );
}
