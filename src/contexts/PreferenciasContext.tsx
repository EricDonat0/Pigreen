import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cores, ModoTema, paletaDoModo } from '../theme/cores';
import { Idioma, Tradutor, criarTradutor, idiomaDoSistema } from '../i18n';

/**
 * Preferências de apresentação: tema, idioma e lembretes.
 *
 * Ficam no AsyncStorage, e não no Firestore, por três razões: precisam estar
 * disponíveis *antes* do login (a tela de entrada já respeita o tema e o
 * idioma), sobrevivem a ficar offline, e não são dados de conta — quem instala
 * o app noutro aparelho normalmente quer as preferências daquele aparelho.
 */

export type PreferenciaTema = ModoTema | 'sistema';

interface Preferencias {
  tema: PreferenciaTema;
  idioma: Idioma;
  lembretes: boolean;
}

interface ContextoPreferencias extends Preferencias {
  /** Modo efetivamente aplicado, já resolvendo "sistema". */
  modo: ModoTema;
  escuro: boolean;
  cores: Cores;
  t: Tradutor;
  definirTema: (tema: PreferenciaTema) => void;
  definirIdioma: (idioma: Idioma) => void;
  definirLembretes: (ativos: boolean) => void;
  /** `false` enquanto as preferências salvas ainda não foram lidas do disco. */
  prontas: boolean;
}

const CHAVE = '@pigreen/preferencias';

const PADRAO: Preferencias = { tema: 'sistema', idioma: 'pt', lembretes: true };

const Contexto = createContext<ContextoPreferencias | null>(null);

/** Idioma inicial: o do aparelho, quando for um dos três suportados. */
function idiomaInicial(): Idioma {
  try {
    return idiomaDoSistema([Intl.DateTimeFormat().resolvedOptions().locale]);
  } catch {
    return 'pt';
  }
}

function normalizar(bruto: unknown): Preferencias {
  if (typeof bruto !== 'object' || bruto === null) return { ...PADRAO, idioma: idiomaInicial() };
  const dados = bruto as Partial<Preferencias>;

  return {
    tema: dados.tema === 'claro' || dados.tema === 'escuro' ? dados.tema : 'sistema',
    idioma:
      dados.idioma === 'pt' || dados.idioma === 'en' || dados.idioma === 'es'
        ? dados.idioma
        : idiomaInicial(),
    lembretes: typeof dados.lembretes === 'boolean' ? dados.lembretes : true,
  };
}

export function ProvedorPreferencias({ children }: { children: ReactNode }) {
  const esquemaSistema = useColorScheme();
  const [preferencias, setPreferencias] = useState<Preferencias>(() => ({
    ...PADRAO,
    idioma: idiomaInicial(),
  }));
  const [prontas, setProntas] = useState(false);

  useEffect(() => {
    let ativo = true;

    void AsyncStorage.getItem(CHAVE)
      .then((bruto) => {
        if (!ativo) return;
        if (bruto) setPreferencias(normalizar(JSON.parse(bruto)));
      })
      .catch(() => undefined)
      .finally(() => {
        if (ativo) setProntas(true);
      });

    return () => {
      ativo = false;
    };
  }, []);

  /**
   * A gravação é disparada por cada mudança e nunca bloqueia a UI: preferência
   * que não persistiu é um incômodo pequeno, tela travada é um incômodo grande.
   */
  const atualizar = useCallback((parcial: Partial<Preferencias>) => {
    setPreferencias((atual) => {
      const novo = { ...atual, ...parcial };
      void AsyncStorage.setItem(CHAVE, JSON.stringify(novo)).catch(() => undefined);
      return novo;
    });
  }, []);

  const modo: ModoTema =
    preferencias.tema === 'sistema'
      ? esquemaSistema === 'dark'
        ? 'escuro'
        : 'claro'
      : preferencias.tema;

  const valor = useMemo<ContextoPreferencias>(
    () => ({
      ...preferencias,
      modo,
      escuro: modo === 'escuro',
      cores: paletaDoModo(modo),
      t: criarTradutor(preferencias.idioma),
      definirTema: (tema) => atualizar({ tema }),
      definirIdioma: (idioma) => atualizar({ idioma }),
      definirLembretes: (lembretes) => atualizar({ lembretes }),
      prontas,
    }),
    [preferencias, modo, prontas, atualizar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

function usePreferencias(): ContextoPreferencias {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('usePreferencias precisa estar dentro de <ProvedorPreferencias>.');
  }
  return contexto;
}

/** Cores do tema em vigor. É o que a maioria dos componentes precisa. */
export function useTema(): { cores: Cores; escuro: boolean; modo: ModoTema } {
  const { cores, escuro, modo } = usePreferencias();
  return { cores, escuro, modo };
}

/** Função de tradução do idioma em vigor. */
export function useTraducao(): Tradutor {
  return usePreferencias().t;
}

/** Acesso completo, para a tela de ajustes. */
export function useConfiguracoes(): ContextoPreferencias {
  return usePreferencias();
}
