import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Texto } from '../../components/Texto';
import { CampoTexto } from '../../components/CampoTexto';
import { BotaoPrimario } from '../../components/BotaoPrimario';
import { TAMANHO_PIN, TecladoPin } from '../../components/TecladoPin';
import { useAutenticacao } from '../../contexts/AutenticacaoContext';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { chaveDeErro } from '../../services/erros';
import { conferirPin, pinValido } from '../../services/pin';
import { espacos, useTema } from '../../theme';

type Fase = 'entrar' | 'criar' | 'confirmar' | 'redefinir';

interface Props {
  aoLiberar: () => void;
}

/**
 * Portão da área do responsável.
 *
 * Três caminhos numa tela só: criar o PIN na primeira vez, digitá-lo nas
 * seguintes, e redefini-lo pela senha da conta quando ele for esquecido — o
 * último é a razão de o PIN poder ser curto, já que existe uma via de
 * recuperação forte por trás dele.
 */
export function PortaoPin({ aoLiberar }: Props) {
  const { usuario, definirPin, confirmarSenha } = useAutenticacao();
  const { cores } = useTema();
  const t = useTraducao();

  const temPin = Boolean(usuario?.hashPin);
  const [fase, setFase] = useState<Fase>(temPin ? 'entrar' : 'criar');
  const [pin, setPin] = useState('');
  const [primeiro, setPrimeiro] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const avaliar = useCallback(
    async (completo: string) => {
      setOcupado(true);
      setErro(null);
      try {
        if (fase === 'entrar') {
          if (await conferirPin(completo, usuario?.hashPin)) aoLiberar();
          else {
            setErro(t('pin.errado'));
            setPin('');
          }
          return;
        }

        if (fase === 'criar') {
          setPrimeiro(completo);
          setPin('');
          setFase('confirmar');
          return;
        }

        if (completo !== primeiro) {
          setErro(t('pin.diferente'));
          setPin('');
          setPrimeiro('');
          setFase('criar');
          return;
        }

        await definirPin(completo);
        aoLiberar();
      } catch (e) {
        setErro(t(chaveDeErro(e)));
        setPin('');
      } finally {
        setOcupado(false);
      }
    },
    [fase, primeiro, usuario, definirPin, aoLiberar, t],
  );

  /**
   * O PIN é avaliado no próprio toque que completa o quarto dígito — é um
   * evento, não um efeito colateral de renderização. Pedir um "confirmar"
   * depois de quatro toques seria uma etapa sem informação nova.
   */
  const digitar = useCallback(
    (novo: string) => {
      setPin(novo);
      if (novo.length === TAMANHO_PIN && pinValido(novo)) void avaliar(novo);
    },
    [avaliar],
  );

  const redefinir = useCallback(async () => {
    setOcupado(true);
    setErro(null);
    try {
      await confirmarSenha(senha);
      setSenha('');
      setPin('');
      setPrimeiro('');
      setFase('criar');
    } catch (e) {
      setErro(t(chaveDeErro(e)));
    } finally {
      setOcupado(false);
    }
  }, [senha, confirmarSenha, t]);

  if (fase === 'redefinir') {
    return (
      <View style={{ gap: espacos.md }}>
        <Texto variante="titulo" centralizado>
          {t('pin.esqueci')}
        </Texto>
        <Texto variante="corpo" centralizado cor={cores.textoSecundario}>
          {t('pin.redefinirTexto')}
        </Texto>

        <CampoTexto rotulo={t('login.senha')} valor={senha} aoMudar={setSenha} senha erro={erro} />

        <BotaoPrimario
          titulo={t('comum.confirmar')}
          onPress={() => void redefinir()}
          carregando={ocupado}
        />
        <BotaoPrimario
          titulo={t('comum.cancelar')}
          variante="fantasma"
          onPress={() => {
            setErro(null);
            setFase(temPin ? 'entrar' : 'criar');
          }}
        />
      </View>
    );
  }

  const titulo =
    fase === 'entrar'
      ? t('pin.entrarTitulo')
      : fase === 'criar'
        ? t('pin.criarTitulo')
        : t('pin.confirmarTitulo');

  return (
    <View style={{ gap: espacos.md }}>
      <Texto variante="titulo" centralizado>
        {titulo}
      </Texto>

      {fase === 'criar' && (
        <Texto variante="corpo" centralizado cor={cores.textoSecundario}>
          {t('pin.criarTexto')}
        </Texto>
      )}

      {erro && (
        <Texto variante="legenda" centralizado cor={cores.erro} accessibilityLiveRegion="polite">
          {erro}
        </Texto>
      )}

      <TecladoPin valor={pin} aoMudar={digitar} desabilitado={ocupado} />

      {temPin && (
        <BotaoPrimario
          titulo={t('pin.esqueci')}
          variante="fantasma"
          onPress={() => {
            setErro(null);
            setFase('redefinir');
          }}
        />
      )}
    </View>
  );
}
