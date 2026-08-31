import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TelaBase } from '../../components/TelaBase';
import { Texto } from '../../components/Texto';
import { BotaoPrimario } from '../../components/BotaoPrimario';
import { CartaoModal } from '../../components/CartaoModal';
import { GrupoAjustes, LinhaAjuste } from '../../components/LinhaAjuste';
import { useAutenticacao } from '../../contexts/AutenticacaoContext';
import { usePet } from '../../contexts/PetContext';
import { useConfiguracoes } from '../../contexts/PreferenciasContext';
import { espacos } from '../../theme';
import type { ChaveTraducao } from '../../i18n';
import type { RotasAjustes } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAjustes, 'Ajustes'>;

const ROTULO_TEMA: Record<string, ChaveTraducao> = {
  claro: 'aparencia.claro',
  escuro: 'aparencia.escuro',
  sistema: 'aparencia.sistema',
};

const ROTULO_IDIOMA: Record<string, ChaveTraducao> = {
  pt: 'idioma.pt',
  en: 'idioma.en',
  es: 'idioma.es',
};

/**
 * Índice dos ajustes.
 *
 * A tela é só navegação e interruptores: cada item pesado mora na sua própria
 * rota. Isso mantém o índice legível conforme o app cresce, e evita que uma
 * tela vire um formulário de trezentas linhas.
 */
export default function Ajustes({ navigation }: Props) {
  const { usuario, sair } = useAutenticacao();
  const { pet } = usePet();
  const { t, tema, idioma, lembretes, definirLembretes } = useConfiguracoes();

  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const rodape = useMemo(
    () => (
      <Texto variante="legenda" centralizado>
        {usuario?.email ?? ''}
      </Texto>
    ),
    [usuario],
  );

  return (
    <TelaBase titulo={t('ajustes.titulo')} espacoInferior={110} rodape={rodape}>
      <GrupoAjustes titulo={t('ajustes.secaoConta')}>
        <LinhaAjuste
          icone="account-outline"
          titulo={t('ajustes.editarPerfil')}
          descricao={t('ajustes.editarPerfilDica')}
          onPress={() => navigation.navigate('EditarPerfil')}
        />
        <LinhaAjuste
          icone="lock-outline"
          titulo={t('ajustes.alterarSenha')}
          descricao={t('ajustes.alterarSenhaDica')}
          onPress={() => navigation.navigate('AlterarSenha')}
          ultima
        />
      </GrupoAjustes>

      <GrupoAjustes titulo={t('ajustes.secaoJogo')}>
        <LinhaAjuste
          icone="pig-variant-outline"
          titulo={t('ajustes.nomePet')}
          valor={pet?.nome}
          onPress={() => navigation.navigate('NomePet')}
        />
        <LinhaAjuste
          icone="tshirt-crew-outline"
          titulo={t('ajustes.customizacao')}
          descricao={t('ajustes.customizacaoDica')}
          onPress={() => navigation.navigate('Customizacao')}
        />
        <LinhaAjuste
          icone="shield-account-outline"
          titulo={t('ajustes.areaResponsavel')}
          descricao={t('ajustes.areaResponsavelDica')}
          onPress={() => navigation.navigate('AreaResponsavel')}
          ultima
        />
      </GrupoAjustes>

      <GrupoAjustes titulo={t('ajustes.secaoApp')}>
        <LinhaAjuste
          icone="theme-light-dark"
          titulo={t('ajustes.aparencia')}
          valor={t(ROTULO_TEMA[tema])}
          onPress={() => navigation.navigate('Aparencia')}
        />
        <LinhaAjuste
          icone="translate"
          titulo={t('ajustes.idioma')}
          valor={t(ROTULO_IDIOMA[idioma])}
          onPress={() => navigation.navigate('Idioma')}
        />
        <LinhaAjuste
          icone="bell-outline"
          titulo={t('ajustes.notificacoes')}
          descricao={t('ajustes.notificacoesDica')}
          interruptor={{ ativo: lembretes, aoMudar: definirLembretes }}
          ultima
        />
      </GrupoAjustes>

      <GrupoAjustes titulo={t('ajustes.secaoSessao')}>
        <LinhaAjuste
          icone="logout"
          titulo={t('ajustes.sair')}
          onPress={() => setConfirmandoSaida(true)}
          destrutiva
          ultima
        />
      </GrupoAjustes>

      <CartaoModal
        visivel={confirmandoSaida}
        aoFechar={() => setConfirmandoSaida(false)}
        comPorquinho
        rodape={
          <View style={{ flexDirection: 'row', gap: espacos.sm }}>
            <BotaoPrimario
              titulo={t('comum.nao')}
              variante="secundaria"
              onPress={() => setConfirmandoSaida(false)}
              style={{ flex: 1 }}
            />
            <BotaoPrimario
              titulo={t('comum.sim')}
              variante="perigo"
              onPress={() => void sair()}
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <Texto variante="titulo" centralizado>
          {t('ajustes.sairPergunta')}
        </Texto>
      </CartaoModal>
    </TelaBase>
  );
}
