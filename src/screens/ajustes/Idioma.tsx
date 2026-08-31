import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TelaBase } from '../../components/TelaBase';
import { Escolha, ListaEscolha } from '../../components/ListaEscolha';
import { useConfiguracoes } from '../../contexts/PreferenciasContext';
import { IDIOMAS } from '../../i18n';
import type { Idioma as CodigoIdioma } from '../../i18n';
import type { RotasAjustes } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAjustes, 'Idioma'>;

export default function Idioma({ navigation }: Props) {
  const { idioma, definirIdioma, t } = useConfiguracoes();

  // Cada opção é rotulada no **próprio** idioma, e não no idioma em vigor:
  // quem abriu o app em espanhol por engano precisa reconhecer "Português".
  const opcoes: Escolha<CodigoIdioma>[] = IDIOMAS.map(({ codigo, chaveRotulo }) => ({
    valor: codigo,
    rotulo: t(chaveRotulo),
  }));

  return (
    <TelaBase titulo={t('idioma.titulo')} aoVoltar={() => navigation.goBack()}>
      <ListaEscolha
        opcoes={opcoes}
        selecionado={idioma}
        aoEscolher={definirIdioma}
        rotuloGrupo={t('idioma.titulo')}
      />
    </TelaBase>
  );
}
