import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Texto } from '../../components/Texto';
import { BotaoPrimario } from '../../components/BotaoPrimario';
import { CartaoModal } from '../../components/CartaoModal';
import { Cenario } from '../../components/jogo/Cenario';
import { Porquinho } from '../../components/jogo/Porquinho';
import { HudNivel } from '../../components/jogo/HudNivel';
import { BarraNecessidade } from '../../components/jogo/BarraNecessidade';
import { CarrosselAlimentos, ItemCarrossel } from '../../components/jogo/CarrosselAlimentos';
import { usePet } from '../../contexts/PetContext';
import { useTraducao } from '../../contexts/PreferenciasContext';
import { NECESSIDADES, DescricaoNecessidade } from '../../domain/necessidades';
import { alimentosBloqueados, chavesDoAlimento } from '../../domain/alimentos';
import { progressoDoNivel } from '../../domain/pet';
import { espacos, raios, sombras, useTema } from '../../theme';
import type { Cores } from '../../theme';
import type { Alimento } from '../../types';

/** Formata a soneca como mm:ss, igual ao card "Dorminhoco" do Figma. */
function formatarSoneca(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutos = String(Math.floor(total / 60)).padStart(2, '0');
  const segundos = String(total % 60).padStart(2, '0');
  return `${minutos}:${segundos}`;
}

/**
 * Tela principal da aba infantil.
 *
 * A tela é deliberadamente "burra": todo o cálculo de estado vive no
 * `PetContext` e no motor de domínio. Aqui só há composição visual e a decisão
 * de qual card modal mostrar — o que mantém a regra do jogo testável sem
 * renderizar nada.
 */
export default function Home() {
  const {
    pet,
    estado,
    sonecaMs,
    cardapio,
    carregando,
    erro,
    alimentar,
    ultimoEvento,
    limparEvento,
    recarregar,
  } = usePet();
  const { cores } = useTema();
  const t = useTraducao();
  const estilos = useMemo(() => criarEstilos(cores), [cores]);

  const [ajuda, setAjuda] = useState<DescricaoNecessidade | null>(null);
  const [alimentoAberto, setAlimentoAberto] = useState<Alimento | null>(null);
  const [avisoSoneca, setAvisoSoneca] = useState(false);
  const [servindo, setServindo] = useState(false);

  const itens = useMemo<ItemCarrossel[]>(() => {
    if (!pet) return [];
    return [
      ...cardapio.map((alimento) => ({ alimento, bloqueado: false })),
      ...alimentosBloqueados(pet.nivel, pet.alimentosDesbloqueados).map((alimento) => ({
        alimento,
        bloqueado: true,
      })),
    ];
  }, [pet, cardapio]);

  const abrirAlimento = useCallback(
    (alimento: Alimento) => {
      // Dormindo, qualquer toque num alimento explica o porquê em vez de
      // simplesmente não responder.
      if (sonecaMs > 0) {
        setAvisoSoneca(true);
        return;
      }
      setAlimentoAberto(alimento);
    },
    [sonecaMs],
  );

  const servir = useCallback(async () => {
    if (!alimentoAberto) return;
    setServindo(true);
    const resultado = await alimentar(alimentoAberto);
    setServindo(false);
    setAlimentoAberto(null);
    if (!resultado.ok && resultado.motivo === 'dormindo') setAvisoSoneca(true);
  }, [alimentoAberto, alimentar]);

  if (carregando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Texto variante="corpo" cor={cores.textoSecundario} style={estilos.espaco}>
          {t('comum.carregando')}
        </Texto>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={estilos.centro}>
        <Texto variante="destaque" centralizado>
          {erro ? t(erro) : t('jogo.semPet')}
        </Texto>
        <BotaoPrimario
          titulo={t('comum.tentarNovamente')}
          onPress={recarregar}
          style={estilos.botaoRecarregar}
        />
      </View>
    );
  }

  const nomeAlimento = alimentoAberto ? t(chavesDoAlimento(alimentoAberto.id).nome) : '';

  return (
    <Cenario>
      <SafeAreaView style={estilos.safe} edges={['top']}>
        <View style={estilos.topo}>
          <HudNivel nivel={pet.nivel} progresso={progressoDoNivel(pet)} nomePet={pet.nome} />

          <View style={estilos.painelStatus}>
            {NECESSIDADES.map((descricao) => (
              <BarraNecessidade
                key={descricao.chave}
                descricao={descricao}
                valor={pet.necessidades[descricao.chave]}
                aoTocarAjuda={setAjuda}
                compacta
              />
            ))}
          </View>
        </View>

        <View style={estilos.palco}>
          <Porquinho estado={estado} nome={pet.nome} tamanho={210} itens={pet.itensEquipados} />

          {sonecaMs > 0 && (
            <View style={estilos.selo}>
              <Texto variante="micro">{t('jogo.acordaEm', { tempo: formatarSoneca(sonecaMs) })}</Texto>
            </View>
          )}
        </View>

        <View style={estilos.rodape}>
          {erro && (
            <Texto variante="legenda" centralizado cor={cores.erro} style={estilos.aviso}>
              {t(erro)}
            </Texto>
          )}
          <CarrosselAlimentos itens={itens} aoSelecionar={abrirAlimento} />
        </View>
      </SafeAreaView>

      {/* Explicação de uma barra de status. */}
      <CartaoModal
        visivel={ajuda != null}
        aoFechar={() => setAjuda(null)}
        titulo={ajuda ? t(ajuda.chaveRotulo) : undefined}
        comPorquinho
      >
        <Texto variante="corpo" centralizado>
          {ajuda ? t(ajuda.chaveExplicacao) : ''}
        </Texto>
      </CartaoModal>

      {/* Ficha do alimento, com a ação de alimentar. */}
      <CartaoModal
        visivel={alimentoAberto != null}
        aoFechar={() => setAlimentoAberto(null)}
        titulo={nomeAlimento}
        rodape={<BotaoPrimario titulo={t('jogo.alimentar')} onPress={servir} carregando={servindo} />}
      >
        <Texto variante="corpo" centralizado>
          {alimentoAberto ? t(chavesDoAlimento(alimentoAberto.id).descricao) : ''}
        </Texto>
      </CartaoModal>

      {/* "Dorminhoco": comeu demais e foi tirar uma soneca. */}
      <CartaoModal
        visivel={avisoSoneca}
        aoFechar={() => setAvisoSoneca(false)}
        titulo={t('jogo.dorminhocoTitulo')}
        comPorquinho
      >
        <Texto variante="corpo" centralizado>
          {t('jogo.dorminhocoTexto', { nome: pet.nome })}
        </Texto>
        <View style={estilos.contador}>
          <Texto variante="destaque">{formatarSoneca(sonecaMs)}</Texto>
        </View>
      </CartaoModal>

      {/* Celebração de nível novo, com os alimentos que foram liberados. */}
      <CartaoModal
        visivel={ultimoEvento?.ganhoDeNivel != null}
        aoFechar={limparEvento}
        titulo={t('jogo.parabens')}
        comPorquinho
        rodape={<BotaoPrimario titulo={t('comum.continuar')} onPress={limparEvento} />}
      >
        <Texto variante="corpo" centralizado>
          {t('jogo.subiuNivel', { nome: pet.nome, nivel: ultimoEvento?.ganhoDeNivel?.nivel ?? 0 })}
          {ultimoEvento?.ganhoDeNivel?.alimentosDesbloqueados.length
            ? t('jogo.desbloqueouComidas')
            : ''}
        </Texto>
      </CartaoModal>
    </Cenario>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    safe: { flex: 1, justifyContent: 'space-between' },
    centro: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: espacos.xl,
      backgroundColor: cores.fundo,
    },
    espaco: { marginTop: espacos.sm },
    botaoRecarregar: { marginTop: espacos.lg, alignSelf: 'stretch' },
    topo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: espacos.sm,
      paddingHorizontal: espacos.md,
      paddingTop: espacos.xs,
    },
    painelStatus: {
      flex: 1,
      maxWidth: 210,
      backgroundColor: cores.fundo,
      opacity: 0.94,
      borderRadius: raios.medio,
      paddingHorizontal: espacos.xs,
      paddingTop: espacos.xs,
    },
    palco: { alignItems: 'center', justifyContent: 'center', gap: espacos.sm },
    selo: {
      backgroundColor: cores.fundo,
      paddingHorizontal: espacos.sm,
      paddingVertical: espacos.xxs,
      borderRadius: raios.pilula,
      ...sombras.cartao,
    },
    // Deixa o carrossel acima da barra de abas flutuante.
    rodape: { paddingBottom: 96 },
    aviso: { marginBottom: espacos.xs, paddingHorizontal: espacos.lg },
    contador: {
      alignSelf: 'center',
      marginTop: espacos.sm,
      paddingHorizontal: espacos.lg,
      paddingVertical: espacos.xs,
      borderRadius: raios.pilula,
      borderWidth: 1.5,
      borderColor: cores.borda,
    },
  });
