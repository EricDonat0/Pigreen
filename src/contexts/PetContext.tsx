import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { useAutenticacao } from './AutenticacaoContext';
import { useRelogio } from '../hooks/useRelogio';
import {
  GanhoDeNivel,
  MotivoRecusa,
  alimentar as alimentarPet,
  definirItens as definirItensPet,
  estadoDoPet,
  projetar,
  registrarVisita,
  renomear,
  sonecaRestante,
} from '../domain/pet';
import { alimentosDisponiveis } from '../domain/alimentos';
import {
  criarPetRemoto,
  observarPet,
  refeicaoPeloHorario,
  registrarAlimentacao,
  salvarEstadoDoPet,
} from '../services/repositorioPet';
import { chaveDeErro } from '../services/erros';
import type { ChaveTraducao } from '../i18n';
import type { Alimento, EstadoPet, Pet } from '../types';

/**
 * Estado do jogo.
 *
 * A divisão importante: o instantâneo guardado é o que veio do Firestore; `pet`
 * é a projeção desse instantâneo no momento atual. Só gravamos quando algo
 * realmente acontece (uma refeição, o bônus diário) ou quando o app vai para
 * segundo plano — o decaimento em si é recalculado, nunca escrito a cada tick.
 * Um jogador que deixa o app aberto por uma hora gera zero writes.
 */

export interface EventoAlimentacao {
  alimento: Alimento;
  adormeceu: boolean;
  ganhoDeNivel: GanhoDeNivel | null;
}

/**
 * O instantâneo carrega o uid junto para que dados de uma sessão anterior
 * nunca vazem para a próxima conta: se o uid não bate com o da sessão atual,
 * o valor simplesmente é ignorado — sem precisar de um `setState` de limpeza.
 */
interface Instantaneo {
  uid: string;
  pet: Pet | null;
  erro: ChaveTraducao | null;
}

interface ContextoPet {
  carregando: boolean;
  /** Chave de mensagem, para a tela traduzir. */
  erro: ChaveTraducao | null;
  pet: Pet | null;
  estado: EstadoPet;
  /** Milissegundos restantes de soneca; 0 quando acordado. */
  sonecaMs: number;
  cardapio: Alimento[];
  ultimoEvento: EventoAlimentacao | null;
  limparEvento: () => void;
  alimentar: (alimento: Alimento) => Promise<{ ok: true } | { ok: false; motivo: MotivoRecusa }>;
  renomearPet: (nome: string) => Promise<void>;
  equiparItens: (ids: readonly string[]) => Promise<void>;
  /** Refaz a assinatura do Firestore depois de uma falha. */
  recarregar: () => void;
}

const Contexto = createContext<ContextoPet | null>(null);

export function ProvedorPet({ children }: { children: ReactNode }) {
  const { conta } = useAutenticacao();
  const agora = useRelogio();

  const [instantaneo, setInstantaneo] = useState<Instantaneo | null>(null);
  const [ultimoEvento, setUltimoEvento] = useState<EventoAlimentacao | null>(null);
  const [tentativa, setTentativa] = useState(0);

  const uid = conta?.uid ?? null;
  const atual = instantaneo && instantaneo.uid === uid ? instantaneo : null;

  const petPersistido = atual?.pet ?? null;
  const carregando = uid != null && atual == null;

  /** Espelho para os callbacks, que rodam depois do commit. */
  const petRef = useRef<Pet | null>(null);
  useEffect(() => {
    petRef.current = petPersistido;
  }, [petPersistido]);

  useEffect(() => {
    if (!uid) return;

    /**
     * Conta sem documento de pet acontece de verdade: o cadastro pode ter
     * falhado entre criar a conta no Auth e gravar o Firestore. Em vez de
     * mostrar uma tela vazia, criamos o pet na hora — a criança nunca fica
     * sem porquinho por causa de uma gravação perdida.
     */
    let criando = false;

    return observarPet(
      uid,
      (pet) => {
        if (pet) {
          setInstantaneo({ uid, pet, erro: null });
          return;
        }
        if (criando) return;
        criando = true;
        void criarPetRemoto(uid, 'Porquinho', Date.now()).catch((erro) => {
          criando = false;
          setInstantaneo({ uid, pet: null, erro: chaveDeErro(erro) });
        });
      },
      (erro) => setInstantaneo({ uid, pet: null, erro: chaveDeErro(erro) }),
    );
  }, [uid, tentativa]);

  const recarregar = useCallback(() => {
    setInstantaneo(null);
    setTentativa((n) => n + 1);
  }, []);

  /** Bônus de "saudade": uma vez por dia, no primeiro carregamento do pet. */
  const visitaRegistrada = useRef<string | null>(null);
  useEffect(() => {
    if (!petPersistido || visitaRegistrada.current === petPersistido.uid) return;

    visitaRegistrada.current = petPersistido.uid;
    const comBonus = registrarVisita(petPersistido, Date.now());
    if (comBonus.necessidades.felicidade !== petPersistido.necessidades.felicidade) {
      void salvarEstadoDoPet(comBonus).catch(() => undefined);
    }
  }, [petPersistido]);

  /**
   * Ao sair de cena, congelamos a projeção atual no banco. Sem isso o estado
   * gravado envelheceria em relação ao que o jogador acabou de ver.
   */
  useEffect(() => {
    const inscricao = AppState.addEventListener('change', (estadoApp) => {
      const pet = petRef.current;
      if (!pet || estadoApp === 'active') return;
      void salvarEstadoDoPet(projetar(pet, Date.now())).catch(() => undefined);
    });
    return () => inscricao.remove();
  }, []);

  const pet = useMemo(
    () => (petPersistido ? projetar(petPersistido, agora) : null),
    [petPersistido, agora],
  );

  /** Grava um pet novo, revertendo o estado local se o servidor recusar. */
  const persistir = useCallback(async (anterior: Pet, novo: Pet): Promise<boolean> => {
    setInstantaneo({ uid: novo.uid, pet: novo, erro: null });
    try {
      await salvarEstadoDoPet(novo);
      return true;
    } catch (erro) {
      setInstantaneo({ uid: anterior.uid, pet: anterior, erro: chaveDeErro(erro) });
      return false;
    }
  }, []);

  const alimentar = useCallback(
    async (alimento: Alimento) => {
      const anterior = petRef.current;
      if (!anterior) return { ok: false as const, motivo: 'bloqueado' as MotivoRecusa };

      const instante = Date.now();
      const resultado = alimentarPet(anterior, alimento, instante);
      if (!resultado.ok) return { ok: false as const, motivo: resultado.motivo };

      // Atualização otimista: a criança vê a barra subir na hora, antes do
      // round-trip. O listener do Firestore confirma (ou corrige) em seguida.
      setUltimoEvento({
        alimento,
        adormeceu: resultado.adormeceu,
        ganhoDeNivel: resultado.ganhoDeNivel,
      });

      const salvou = await persistir(anterior, resultado.pet);
      if (!salvou) {
        setUltimoEvento(null);
        return { ok: false as const, motivo: 'bloqueado' as MotivoRecusa };
      }

      // O histórico é secundário: se ele falhar, a refeição já valeu para o
      // jogo e não faz sentido desfazer o que a criança acabou de ver.
      await registrarAlimentacao(anterior.uid, {
        alimentoId: alimento.id,
        refeicao: refeicaoPeloHorario(instante),
        em: instante,
      }).catch(() => undefined);

      return { ok: true as const };
    },
    [persistir],
  );

  const renomearPet = useCallback(
    async (nome: string) => {
      const anterior = petRef.current;
      if (!anterior) return;
      await persistir(anterior, renomear(projetar(anterior, Date.now()), nome));
    },
    [persistir],
  );

  const equiparItens = useCallback(
    async (ids: readonly string[]) => {
      const anterior = petRef.current;
      if (!anterior) return;
      await persistir(anterior, definirItensPet(projetar(anterior, Date.now()), ids));
    },
    [persistir],
  );

  const limparEvento = useCallback(() => setUltimoEvento(null), []);

  const valor = useMemo<ContextoPet>(
    () => ({
      carregando,
      erro: atual?.erro ?? null,
      pet,
      estado: pet ? estadoDoPet(pet, agora) : 'normal',
      sonecaMs: pet ? sonecaRestante(pet, agora) : 0,
      cardapio: pet ? alimentosDisponiveis(pet.nivel, pet.alimentosDesbloqueados) : [],
      ultimoEvento,
      limparEvento,
      alimentar,
      renomearPet,
      equiparItens,
      recarregar,
    }),
    [
      carregando,
      atual,
      pet,
      agora,
      ultimoEvento,
      limparEvento,
      alimentar,
      renomearPet,
      equiparItens,
      recarregar,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePet(): ContextoPet {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('usePet precisa estar dentro de <ProvedorPet>.');
  return contexto;
}
