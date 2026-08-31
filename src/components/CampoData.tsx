import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Texto } from './Texto';
import { BotaoPrimario } from './BotaoPrimario';
import { CartaoModal } from './CartaoModal';
import { OpcaoRoda, RodaSeletora } from './RodaSeletora';
import { alvoToque, espacos, useTema } from '../theme';
import type { Cores } from '../theme';
import { useConfiguracoes } from '../contexts/PreferenciasContext';

interface Props {
  rotulo: string;
  /** Data selecionada, ou `null` enquanto o usuário não escolheu nenhuma. */
  valor: Date | null;
  aoMudar: (data: Date) => void;
  erro?: string | null;
  anoMinimo?: number;
  anoMaximo?: number;
}

const LOCALES = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' } as const;

/** Dias que o mês realmente tem, respeitando ano bissexto. */
function diasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate();
}

/**
 * Seletor de data próprio.
 *
 * O componente entrega um `Date` e nunca uma string formatada: converter para
 * texto na borda da UI evita que a data de nascimento chegue ao Firestore como
 * `"04 / 09 / 2019"`, formato que não dá para ordenar nem comparar.
 *
 * Ao trocar de mês ou de ano o dia é limitado ao último dia válido — sem isso,
 * 31 de janeiro viraria 3 de março ao mudar para fevereiro.
 */
export function CampoData({
  rotulo,
  valor,
  aoMudar,
  erro = null,
  anoMinimo,
  anoMaximo,
}: Props) {
  const { cores } = useTema();
  const { idioma, t } = useConfiguracoes();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const [aberto, setAberto] = useState(false);
  const hoje = useMemo(() => new Date(), []);
  const [rascunho, setRascunho] = useState<Date>(() => valor ?? new Date(hoje.getFullYear() - 6, 0, 1));

  const locale = LOCALES[idioma];
  const formatador = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    [locale],
  );
  const nomesDeMes = useMemo(() => {
    const nomes = new Intl.DateTimeFormat(locale, { month: 'short' });
    return Array.from({ length: 12 }, (_, m) => nomes.format(new Date(2020, m, 1)));
  }, [locale]);

  const ultimoAno = anoMaximo ?? hoje.getFullYear();
  const primeiroAno = anoMinimo ?? ultimoAno - 18;

  const anos: OpcaoRoda[] = useMemo(
    () =>
      Array.from({ length: ultimoAno - primeiroAno + 1 }, (_, i) => ({
        valor: primeiroAno + i,
        rotulo: String(primeiroAno + i),
      })),
    [primeiroAno, ultimoAno],
  );
  const meses: OpcaoRoda[] = useMemo(
    () => nomesDeMes.map((nome, i) => ({ valor: i, rotulo: nome })),
    [nomesDeMes],
  );
  const dias: OpcaoRoda[] = useMemo(() => {
    const total = diasNoMes(rascunho.getFullYear(), rascunho.getMonth());
    return Array.from({ length: total }, (_, i) => ({ valor: i + 1, rotulo: String(i + 1) }));
  }, [rascunho]);

  const trocar = (partes: { ano?: number; mes?: number; dia?: number }) => {
    const ano = partes.ano ?? rascunho.getFullYear();
    const mes = partes.mes ?? rascunho.getMonth();
    const dia = Math.min(partes.dia ?? rascunho.getDate(), diasNoMes(ano, mes));
    setRascunho(new Date(ano, mes, dia));
  };

  const confirmar = () => {
    aoMudar(rascunho);
    setAberto(false);
  };

  const abrir = () => {
    setRascunho(valor ?? new Date(hoje.getFullYear() - 6, 0, 1));
    setAberto(true);
  };

  return (
    <View style={estilos.wrapper}>
      <Texto variante="corpo" style={estilos.rotulo}>
        {rotulo}
      </Texto>

      <Pressable
        onPress={abrir}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}: ${valor ? formatador.format(valor) : t('data.vazia')}`}
        style={estilos.linha}
      >
        <MaterialCommunityIcons name="calendar-blank-outline" size={26} color={cores.texto} />
        <View style={[estilos.campo, erro ? estilos.campoErro : null]}>
          <Texto
            variante="corpo"
            cor={valor ? cores.texto : cores.textoDesabilitado}
            centralizado
            style={estilos.data}
          >
            {valor ? formatador.format(valor) : '––  /  ––  /  ––––'}
          </Texto>
        </View>
        <MaterialCommunityIcons name="chevron-double-down" size={28} color={cores.primaria} />
      </Pressable>

      {erro ? (
        <Texto variante="legenda" cor={cores.erro} style={estilos.erro}>
          {erro}
        </Texto>
      ) : null}

      <CartaoModal
        visivel={aberto}
        aoFechar={() => setAberto(false)}
        titulo={t('data.escolher')}
        rodape={<BotaoPrimario titulo={t('comum.confirmar')} onPress={confirmar} />}
      >
        <View style={estilos.rodas}>
          <RodaSeletora
            rotulo={t('data.dia')}
            opcoes={dias}
            valor={rascunho.getDate()}
            aoMudar={(dia) => trocar({ dia })}
            largura={74}
          />
          <RodaSeletora
            rotulo={t('data.mes')}
            opcoes={meses}
            valor={rascunho.getMonth()}
            aoMudar={(mes) => trocar({ mes })}
            largura={96}
          />
          <RodaSeletora
            rotulo={t('data.ano')}
            opcoes={anos}
            valor={rascunho.getFullYear()}
            aoMudar={(ano) => trocar({ ano })}
            largura={92}
          />
        </View>

        <Texto variante="destaque" centralizado style={estilos.previa}>
          {formatador.format(rascunho)}
        </Texto>
      </CartaoModal>
    </View>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    wrapper: { width: '100%', marginBottom: espacos.lg },
    rotulo: { marginBottom: espacos.xs },
    linha: { flexDirection: 'row', alignItems: 'center', minHeight: alvoToque },
    campo: {
      flex: 1,
      borderBottomWidth: 1.2,
      borderBottomColor: cores.borda,
      marginHorizontal: espacos.sm,
      paddingBottom: espacos.xxs,
    },
    campoErro: { borderBottomColor: cores.erro },
    data: { letterSpacing: 1.5 },
    erro: { marginTop: espacos.xxs },
    rodas: { flexDirection: 'row', justifyContent: 'center', gap: espacos.xs },
    previa: { marginTop: espacos.md },
  });
