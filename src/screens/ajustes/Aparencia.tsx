import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TelaBase } from '../../components/TelaBase';
import { Texto } from '../../components/Texto';
import { Escolha, ListaEscolha } from '../../components/ListaEscolha';
import { useConfiguracoes } from '../../contexts/PreferenciasContext';
import type { PreferenciaTema } from '../../contexts/PreferenciasContext';
import { espacos, useTema } from '../../theme';
import type { RotasAjustes } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAjustes, 'Aparencia'>;

export default function Aparencia({ navigation }: Props) {
  const { tema, definirTema, t } = useConfiguracoes();
  const { cores } = useTema();

  const opcoes: Escolha<PreferenciaTema>[] = [
    { valor: 'sistema', rotulo: t('aparencia.sistema') },
    { valor: 'claro', rotulo: t('aparencia.claro') },
    { valor: 'escuro', rotulo: t('aparencia.escuro') },
  ];

  return (
    <TelaBase titulo={t('aparencia.titulo')} aoVoltar={() => navigation.goBack()}>
      <ListaEscolha
        opcoes={opcoes}
        selecionado={tema}
        aoEscolher={definirTema}
        rotuloGrupo={t('aparencia.titulo')}
      />
      <Texto
        variante="legenda"
        cor={cores.textoSecundario}
        style={{ marginTop: espacos.sm, marginLeft: espacos.xs }}
      >
        {t('aparencia.dica')}
      </Texto>
    </TelaBase>
  );
}
