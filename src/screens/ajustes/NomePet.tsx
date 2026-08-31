import React, { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TelaBase } from '../../components/TelaBase';
import { CampoTexto } from '../../components/CampoTexto';
import { BotaoPrimario } from '../../components/BotaoPrimario';
import { Porquinho } from '../../components/jogo/Porquinho';
import { usePet } from '../../contexts/PetContext';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { espacos } from '../../theme';
import type { RotasAjustes } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAjustes, 'NomePet'>;

export default function NomePet({ navigation }: Props) {
  const { pet, estado, renomearPet } = usePet();
  const t = useTraducao();

  const [nome, setNome] = useState(pet?.nome ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const salvar = useCallback(async () => {
    if (nome.trim().length === 0) {
      setErro(t('nomePet.vazio'));
      return;
    }
    setSalvando(true);
    await renomearPet(nome);
    setSalvando(false);
    navigation.goBack();
  }, [nome, renomearPet, navigation, t]);

  return (
    <TelaBase
      titulo={t('nomePet.titulo')}
      aoVoltar={() => navigation.goBack()}
      rodape={
        <BotaoPrimario titulo={t('comum.salvar')} onPress={() => void salvar()} carregando={salvando} />
      }
    >
      {/* Pré-visualização: o nome digitado é o rótulo de acessibilidade do
          sprite, então a mudança é perceptível também por leitor de tela. */}
      <Porquinho estado={estado} nome={nome || (pet?.nome ?? '')} tamanho={160} itens={pet?.itensEquipados} />

      <CampoTexto
        rotulo={t('nomePet.campo')}
        valor={nome}
        aoMudar={(texto) => {
          setNome(texto);
          setErro(null);
        }}
        erro={erro}
        autoCapitalize="words"
        maxLength={20}
        style={{ marginTop: espacos.lg }}
      />
    </TelaBase>
  );
}
