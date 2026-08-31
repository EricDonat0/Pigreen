import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TelaBase } from '../../components/TelaBase';
import { Texto } from '../../components/Texto';
import { PortaoPin } from './PortaoPin';
import { useAutenticacao } from '../../contexts/AutenticacaoContext';
import { usePet } from '../../contexts/PetContext';
import { useConfiguracoes } from '../../contexts/PreferenciasContext';
import { historicoDoDia } from '../../services/repositorioPet';
import { chaveDeErro } from '../../services/erros';
import { chavesDoAlimento } from '../../domain/alimentos';
import { progressoDoNivel } from '../../domain/pet';
import { espacos, raios, useTema } from '../../theme';
import type { Cores } from '../../theme';
import type { ChaveTraducao } from '../../i18n';
import { REFEICOES } from '../../types';
import type { Refeicao, RegistroAlimentacao } from '../../types';
import type { RotasAjustes } from '../../navigation/tipos';

type Props = NativeStackScreenProps<RotasAjustes, 'AreaResponsavel'>;

const LOCALES = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' } as const;
const DIAS_NA_FAIXA = 7;

/** Os últimos sete dias, do mais antigo para hoje. */
function faixaDeDias(hoje: Date): Date[] {
  return Array.from({ length: DIAS_NA_FAIXA }, (_, i) => {
    const dia = new Date(hoje);
    dia.setHours(0, 0, 0, 0);
    dia.setDate(dia.getDate() - (DIAS_NA_FAIXA - 1 - i));
    return dia;
  });
}

const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/**
 * Área do responsável: nível da criança e histórico alimentar por refeição.
 *
 * O acesso passa pelo `PortaoPin` e a liberação vale só enquanto a tela está
 * montada — sair e voltar pede o PIN de novo. Guardar a liberação em memória
 * global economizaria toques e destruiria o propósito da tela.
 */
export default function AreaResponsavel({ navigation }: Props) {
  const { usuario } = useAutenticacao();
  const { pet } = usePet();
  const { cores } = useTema();
  const { idioma, t } = useConfiguracoes();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const [liberado, setLiberado] = useState(false);

  const hoje = useMemo(() => new Date(), []);
  const dias = useMemo(() => faixaDeDias(hoje), [hoje]);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(() => dias[dias.length - 1]);

  /**
   * O resultado carrega o dia junto. Assim "carregando" é derivado — o dia
   * pedido ainda não é o dia respondido — em vez de um `setState` síncrono
   * dentro do efeito, que dispararia uma renderização em cascata a cada troca
   * de dia.
   */
  const [resultado, setResultado] = useState<{
    dia: string;
    registros: RegistroAlimentacao[];
    erro: ChaveTraducao | null;
  } | null>(null);

  const chaveDia = diaSelecionado.toDateString();
  const atual = resultado?.dia === chaveDia ? resultado : null;
  const registros = atual?.registros ?? null;
  const erro = atual?.erro ?? null;

  const locale = LOCALES[idioma];
  const formatadorDia = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    [locale],
  );
  const formatadorCompleto = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long' }),
    [locale],
  );
  const formatadorHora = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }),
    [locale],
  );

  useEffect(() => {
    if (!liberado || !usuario) return;

    let ativo = true;
    historicoDoDia(usuario.uid, diaSelecionado)
      .then((lista) => {
        if (ativo) setResultado({ dia: chaveDia, registros: lista, erro: null });
      })
      .catch((e: unknown) => {
        if (ativo) setResultado({ dia: chaveDia, registros: [], erro: chaveDeErro(e) });
      });

    return () => {
      ativo = false;
    };
  }, [liberado, usuario, diaSelecionado, chaveDia]);

  const porRefeicao = useMemo(() => {
    const mapa = new Map<Refeicao, RegistroAlimentacao[]>();
    for (const registro of registros ?? []) {
      const atual = mapa.get(registro.refeicao) ?? [];
      atual.push(registro);
      mapa.set(registro.refeicao, atual);
    }
    return mapa;
  }, [registros]);

  if (!liberado) {
    return (
      <TelaBase titulo={t('responsavel.titulo')} aoVoltar={() => navigation.goBack()}>
        <PortaoPin aoLiberar={() => setLiberado(true)} />
      </TelaBase>
    );
  }

  return (
    <TelaBase titulo={t('responsavel.titulo')} aoVoltar={() => navigation.goBack()}>
      {/* Nível da criança, como no card do protótipo. */}
      <View style={estilos.cartaoNivel}>
        <View style={estilos.textosNivel}>
          <Texto variante="corpoForte">
            {t('responsavel.nivelDe', { nome: usuario?.nomeCrianca ?? '' })}
          </Texto>
          <View style={estilos.barra}>
            <View
              style={[
                estilos.preenchimento,
                { width: `${Math.round((pet ? progressoDoNivel(pet) : 0) * 100)}%` },
              ]}
            />
          </View>
        </View>
        <View style={estilos.medalha}>
          <Texto variante="destaque">{pet?.nivel ?? 1}</Texto>
        </View>
      </View>

      {/* Faixa de dias. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.faixa}
      >
        {dias.map((dia) => {
          const ativo = mesmoDia(dia, diaSelecionado);
          return (
            <Pressable
              key={dia.toISOString()}
              onPress={() => setDiaSelecionado(dia)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={formatadorCompleto.format(dia)}
              style={[estilos.dia, ativo && estilos.diaAtivo]}
            >
              <Texto variante="micro" cor={ativo ? cores.sobrePrimaria : cores.textoSecundario}>
                {formatadorDia.format(dia).slice(0, 3)}
              </Texto>
              <Texto variante="corpoForte" cor={ativo ? cores.sobrePrimaria : cores.texto}>
                {dia.getDate()}
              </Texto>
            </Pressable>
          );
        })}
      </ScrollView>

      <Texto variante="titulo" style={estilos.tituloHistorico}>
        {t('responsavel.historico')}
      </Texto>
      <Texto variante="legenda" cor={cores.textoSecundario} style={estilos.subtitulo}>
        {mesmoDia(diaSelecionado, hoje)
          ? t('responsavel.hoje')
          : formatadorCompleto.format(diaSelecionado)}
        {registros ? ` · ${t('responsavel.resumo', { total: registros.length })}` : ''}
      </Texto>

      {registros === null ? (
        <ActivityIndicator color={cores.primaria} style={estilos.carregando} />
      ) : erro ? (
        <Texto variante="corpo" cor={cores.erro} centralizado style={estilos.carregando}>
          {t(erro)}
        </Texto>
      ) : registros.length === 0 ? (
        <Texto variante="corpo" cor={cores.textoSecundario} centralizado style={estilos.carregando}>
          {t('responsavel.semRegistros')}
        </Texto>
      ) : (
        REFEICOES.filter((refeicao) => porRefeicao.has(refeicao)).map((refeicao) => (
          <View key={refeicao} style={estilos.bloco}>
            <View style={estilos.cabecalhoBloco}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={16}
                color={cores.secundaria}
              />
              <Texto variante="corpoForte">{t(`refeicao.${refeicao}` as ChaveTraducao)}</Texto>
            </View>

            {(porRefeicao.get(refeicao) ?? []).map((registro) => (
              <View key={registro.id} style={estilos.item}>
                <Texto variante="corpo">{t(chavesDoAlimento(registro.alimentoId).nome)}</Texto>
                <Texto variante="legenda" cor={cores.textoSecundario}>
                  {formatadorHora.format(new Date(registro.em))}
                </Texto>
              </View>
            ))}
          </View>
        ))
      )}
    </TelaBase>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    cartaoNivel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espacos.sm,
      backgroundColor: cores.primariaSutil,
      borderRadius: raios.medio,
      padding: espacos.md,
      marginBottom: espacos.md,
    },
    textosNivel: { flex: 1, gap: espacos.xs },
    barra: {
      height: 10,
      borderRadius: raios.pilula,
      backgroundColor: cores.fundoElevado,
      overflow: 'hidden',
    },
    preenchimento: { height: '100%', backgroundColor: cores.primaria },
    medalha: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: cores.fundoElevado,
      alignItems: 'center',
      justifyContent: 'center',
    },
    faixa: { gap: espacos.xs, paddingVertical: espacos.xxs },
    dia: {
      width: 46,
      paddingVertical: espacos.xs,
      borderRadius: raios.medio,
      alignItems: 'center',
      backgroundColor: cores.fundoElevado,
    },
    diaAtivo: { backgroundColor: cores.primariaSuave },
    tituloHistorico: { marginTop: espacos.lg },
    subtitulo: { marginBottom: espacos.sm },
    carregando: { marginTop: espacos.xl },
    bloco: {
      backgroundColor: cores.fundoElevado,
      borderRadius: raios.medio,
      padding: espacos.sm,
      marginBottom: espacos.sm,
      gap: espacos.xxs,
    },
    cabecalhoBloco: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espacos.xs,
      marginBottom: espacos.xxs,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: espacos.xxs,
    },
  });
