import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { PerfilDieta, Usuario } from '../types';

/**
 * Acesso à coleção `usuarios`. Todo o conhecimento sobre o *formato* do
 * documento no Firestore mora aqui: as telas só veem o tipo `Usuario`.
 */

const COLECAO = 'usuarios';

export interface DadosCadastro {
  nomeResponsavel: string;
  nomeCrianca: string;
  email: string;
  nascimentoCrianca: string;
  dieta: PerfilDieta;
}

/** Campos que o responsável pode editar depois do cadastro. */
export type DadosEditaveis = Omit<DadosCadastro, 'email'>;

interface UsuarioDoc extends DadosCadastro {
  criadoEm: number;
  hashPin?: string;
}

export async function criarUsuario(uid: string, dados: DadosCadastro): Promise<Usuario> {
  const documento: UsuarioDoc = { ...dados, criadoEm: Date.now() };

  await setDoc(doc(db, COLECAO, uid), {
    ...documento,
    // Guardamos também o carimbo do servidor: `criadoEm` vem do relógio do
    // aparelho e pode estar errado, mas é o que o domínio consome offline.
    criadoEmServidor: serverTimestamp(),
  });

  return { uid, ...documento };
}

export async function buscarUsuario(uid: string): Promise<Usuario | null> {
  const snap = await getDoc(doc(db, COLECAO, uid));
  if (!snap.exists()) return null;

  const dados = snap.data() as UsuarioDoc;
  return {
    uid,
    nomeResponsavel: dados.nomeResponsavel ?? '',
    nomeCrianca: dados.nomeCrianca ?? '',
    email: dados.email ?? '',
    nascimentoCrianca: dados.nascimentoCrianca ?? '',
    dieta: dados.dieta ?? 'transicao',
    criadoEm: dados.criadoEm ?? Date.now(),
    hashPin: dados.hashPin,
  };
}

export async function atualizarUsuario(uid: string, dados: DadosEditaveis): Promise<void> {
  await updateDoc(doc(db, COLECAO, uid), { ...dados });
}

export async function definirHashPin(uid: string, hashPin: string): Promise<void> {
  await updateDoc(doc(db, COLECAO, uid), { hashPin });
}
