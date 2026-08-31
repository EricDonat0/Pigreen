import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  EmailAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  DadosCadastro,
  DadosEditaveis,
  atualizarUsuario,
  buscarUsuario,
  criarUsuario,
  definirHashPin,
} from '../services/repositorioUsuario';
import { criarPetRemoto } from '../services/repositorioPet';
import { gerarHashPin } from '../services/pin';
import type { Usuario } from '../types';

/**
 * Fonte única de verdade sobre "quem está logado".
 *
 * O estado tem três fases distintas e a UI precisa das três: `carregando`
 * (ainda restaurando a sessão do AsyncStorage — mostrar splash), autenticado
 * com perfil, e deslogado. Colapsar as duas primeiras faz a tela de login
 * piscar a cada abertura do app.
 */

interface EstadoAutenticacao {
  carregando: boolean;
  conta: User | null;
  usuario: Usuario | null;
}

interface ContextoAutenticacao extends EstadoAutenticacao {
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: DadosCadastro, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  recuperarSenha: (email: string) => Promise<void>;
  atualizarPerfil: (dados: DadosEditaveis) => Promise<void>;
  alterarSenha: (senhaAtual: string, novaSenha: string) => Promise<void>;
  definirPin: (pin: string) => Promise<void>;
  /** Reconfirma a senha da conta — usado para redefinir o PIN esquecido. */
  confirmarSenha: (senha: string) => Promise<void>;
  recarregarUsuario: () => Promise<void>;
}

const Contexto = createContext<ContextoAutenticacao | null>(null);

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAutenticacao>({
    carregando: true,
    conta: null,
    usuario: null,
  });

  useEffect(() => {
    let ativo = true;

    const cancelar = onAuthStateChanged(auth, async (conta) => {
      if (!conta) {
        if (ativo) setEstado({ carregando: false, conta: null, usuario: null });
        return;
      }

      // O perfil pode faltar se o cadastro caiu entre criar a conta no Auth e
      // gravar o documento. Nesse caso seguimos autenticados sem perfil — as
      // telas que dependem dele sabem lidar com `null`.
      const usuario = await buscarUsuario(conta.uid).catch(() => null);
      if (ativo) setEstado({ carregando: false, conta, usuario });
    });

    return () => {
      ativo = false;
      cancelar();
    };
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
  }, []);

  const cadastrar = useCallback(async (dados: DadosCadastro, senha: string) => {
    const email = dados.email.trim().toLowerCase();
    const { user } = await createUserWithEmailAndPassword(auth, email, senha);

    const usuario = await criarUsuario(user.uid, { ...dados, email });
    // O pet nasce junto da conta: nenhuma tela precisa lidar com "usuário sem pet".
    await criarPetRemoto(user.uid, 'Porquinho', Date.now());

    setEstado((atual) => ({ ...atual, usuario }));
  }, []);

  const sair = useCallback(async () => {
    await signOut(auth);
  }, []);

  const recuperarSenha = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  }, []);

  const recarregarUsuario = useCallback(async () => {
    const conta = auth.currentUser;
    if (!conta) return;
    const usuario = await buscarUsuario(conta.uid).catch(() => null);
    setEstado((atual) => ({ ...atual, usuario }));
  }, []);

  const atualizarPerfil = useCallback(async (dados: DadosEditaveis) => {
    const conta = auth.currentUser;
    if (!conta) throw new Error('Sem sessão ativa.');

    await atualizarUsuario(conta.uid, dados);
    setEstado((atual) => ({
      ...atual,
      usuario: atual.usuario ? { ...atual.usuario, ...dados } : atual.usuario,
    }));
  }, []);

  /**
   * Trocar a senha exige reautenticar: o Firebase recusa a operação quando o
   * login é antigo, e pedir a senha atual também impede que alguém com o
   * aparelho desbloqueado nas mãos assuma a conta.
   */
  const reautenticar = useCallback(async (senha: string) => {
    const conta = auth.currentUser;
    if (!conta?.email) throw new Error('Sem sessão ativa.');
    await reauthenticateWithCredential(conta, EmailAuthProvider.credential(conta.email, senha));
  }, []);

  const alterarSenha = useCallback(
    async (senhaAtual: string, novaSenha: string) => {
      await reautenticar(senhaAtual);
      const conta = auth.currentUser;
      if (!conta) throw new Error('Sem sessão ativa.');
      await updatePassword(conta, novaSenha);
    },
    [reautenticar],
  );

  const confirmarSenha = useCallback(
    async (senha: string) => {
      await reautenticar(senha);
    },
    [reautenticar],
  );

  const definirPin = useCallback(async (pin: string) => {
    const conta = auth.currentUser;
    if (!conta) throw new Error('Sem sessão ativa.');

    const hashPin = await gerarHashPin(pin);
    await definirHashPin(conta.uid, hashPin);
    setEstado((atual) => ({
      ...atual,
      usuario: atual.usuario ? { ...atual.usuario, hashPin } : atual.usuario,
    }));
  }, []);

  const valor = useMemo<ContextoAutenticacao>(
    () => ({
      ...estado,
      entrar,
      cadastrar,
      sair,
      recuperarSenha,
      atualizarPerfil,
      alterarSenha,
      definirPin,
      confirmarSenha,
      recarregarUsuario,
    }),
    [
      estado,
      entrar,
      cadastrar,
      sair,
      recuperarSenha,
      atualizarPerfil,
      alterarSenha,
      definirPin,
      confirmarSenha,
      recarregarUsuario,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAutenticacao(): ContextoAutenticacao {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useAutenticacao precisa estar dentro de <ProvedorAutenticacao>.');
  }
  return contexto;
}
