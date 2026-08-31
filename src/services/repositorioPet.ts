import {
  Unsubscribe,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { criarPet } from '../domain/pet';
import type { Instante, Pet, Refeicao, RegistroAlimentacao } from '../types';

/**
 * Acesso ao pet e ao histórico de alimentação.
 *
 * Um pet por conta, no documento `pets/{uid}` — assim as Security Rules ficam
 * triviais (`request.auth.uid == uid`) e a leitura em tempo real é um único
 * listener, sem query.
 */

const COLECAO = 'pets';
const SUBCOLECAO_HISTORICO = 'historico';

const refPet = (uid: string) => doc(db, COLECAO, uid);

/** Preenche campos ausentes para que um documento antigo nunca quebre a UI. */
function normalizar(uid: string, bruto: Record<string, unknown>): Pet {
  const base = criarPet(uid, 'Porquinho', Date.now());
  const necessidades = (bruto.necessidades ?? {}) as Partial<Pet['necessidades']>;

  return {
    uid,
    nome: (bruto.nome as string) ?? base.nome,
    nivel: (bruto.nivel as number) ?? base.nivel,
    xp: (bruto.xp as number) ?? 0,
    necessidades: {
      saude: necessidades.saude ?? base.necessidades.saude,
      saciedade: necessidades.saciedade ?? base.necessidades.saciedade,
      felicidade: necessidades.felicidade ?? base.necessidades.felicidade,
    },
    atualizadoEm: (bruto.atualizadoEm as number) ?? base.atualizadoEm,
    dormeAte: (bruto.dormeAte as number | null) ?? null,
    itensEquipados: (bruto.itensEquipados as string[]) ?? [],
    alimentosDesbloqueados:
      (bruto.alimentosDesbloqueados as string[]) ?? base.alimentosDesbloqueados,
    criadoEm: (bruto.criadoEm as number) ?? base.criadoEm,
  };
}

/** Cria o documento do pet. Sobrescreve — use só quando ele não existir. */
export async function criarPetRemoto(uid: string, nome: string, agora: Instante): Promise<Pet> {
  const novo = criarPet(uid, nome, agora);
  await setDoc(refPet(uid), novo);
  return novo;
}

/**
 * Escuta o pet em tempo real. `includeMetadataChanges` fica desligado de
 * propósito: só queremos reagir a mudanças de dado, não a idas e vindas do
 * cache offline.
 */
export function observarPet(
  uid: string,
  aoMudar: (pet: Pet | null) => void,
  aoFalhar: (erro: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    refPet(uid),
    (snap) => aoMudar(snap.exists() ? normalizar(uid, snap.data()) : null),
    aoFalhar,
  );
}

/**
 * Persiste apenas o que o motor de jogo pode mudar. Enviar o objeto inteiro
 * sobrescreveria campos que outra aba tenha escrito entre a leitura e a
 * gravação.
 */
export async function salvarEstadoDoPet(pet: Pet): Promise<void> {
  await updateDoc(refPet(pet.uid), {
    nome: pet.nome,
    nivel: pet.nivel,
    xp: pet.xp,
    necessidades: pet.necessidades,
    atualizadoEm: pet.atualizadoEm,
    dormeAte: pet.dormeAte,
    alimentosDesbloqueados: pet.alimentosDesbloqueados,
    itensEquipados: pet.itensEquipados,
  });
}

export async function registrarAlimentacao(
  uid: string,
  registro: Omit<RegistroAlimentacao, 'id'>,
): Promise<void> {
  await addDoc(collection(db, COLECAO, uid, SUBCOLECAO_HISTORICO), registro);
}

/**
 * Refeições de um dia, em ordem cronológica.
 *
 * O filtro é por faixa de `em` em vez de um campo `dia` gravado junto: assim
 * não há dado derivado para sair de sincronia, e a consulta usa apenas o
 * índice de campo único que o Firestore cria sozinho.
 */
export async function historicoDoDia(uid: string, dia: Date): Promise<RegistroAlimentacao[]> {
  const inicio = new Date(dia);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);

  const consulta = query(
    collection(db, COLECAO, uid, SUBCOLECAO_HISTORICO),
    where('em', '>=', inicio.getTime()),
    where('em', '<', fim.getTime()),
    orderBy('em'),
  );

  const snap = await getDocs(consulta);
  return snap.docs.map((d) => {
    const dados = d.data() as Omit<RegistroAlimentacao, 'id'>;
    return { id: d.id, alimentoId: dados.alimentoId, refeicao: dados.refeicao, em: dados.em };
  });
}

/**
 * Refeição sugerida pelo horário do aparelho. A aba do responsável permite
 * corrigir depois; aqui só evitamos perguntar isso a uma criança.
 */
export function refeicaoPeloHorario(agora: Instante): Refeicao {
  const hora = new Date(agora).getHours();
  if (hora < 10) return 'cafe_da_manha';
  if (hora < 12) return 'lanche_da_manha';
  if (hora < 15) return 'almoco';
  if (hora < 18) return 'lanche_da_tarde';
  return 'jantar';
}
