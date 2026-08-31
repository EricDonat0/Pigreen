import type { Alimento, EstadoPet, Instante, Necessidades, Pet } from '../types';
import { ALIMENTOS_INICIAIS, alimentosDisponiveis } from './alimentos';

/**
 * Motor de jogo do Pigreen.
 *
 * Tudo aqui é função pura: recebe um `Pet` e um instante, devolve um `Pet`
 * novo. Nada de `Date.now()` implícito, nada de Firebase, nada de React. Isso
 * torna o comportamento inteiramente testável e — mais importante — permite
 * **progressão offline**: em vez de rodar um timer enquanto o app está aberto,
 * persistimos o instante do último cálculo e projetamos as necessidades sob
 * demanda. Fechar o app por dois dias produz exatamente o mesmo resultado que
 * deixá-lo aberto por dois dias.
 */

const MINUTO = 60_000;
const HORA = 60 * MINUTO;

export const REGRAS = {
  /** Tempo para a saciedade ir de 100 a 0. ~3 refeições por dia, como diz o app. */
  saciedadeZeraEm: 12 * HORA,
  /** Tempo para a felicidade ir de 100 a 0 sem nenhuma interação. */
  felicidadeZeraEm: 48 * HORA,
  /** Abaixo deste nível de saciedade o pet passa fome e perde saúde. */
  limiarFome: 30,
  /** Acima deste nível o pet está bem alimentado e recupera saúde. */
  limiarSaciado: 60,
  saudePerdaPorHoraComFome: 6,
  saudeGanhoPorHoraSaciado: 3,
  /** Comer até quase encher provoca uma soneca — o "Dorminhoco" do Figma. */
  saciedadeParaDormir: 90,
  duracaoSoneca: 30 * MINUTO,
  /** Bônus por abrir o app num dia novo ("ele sente saudade e quer te ver"). */
  bonusVisitaDiaria: 12,
  /** XP exigido para sair do nível 1; cada nível seguinte pede 60 a mais. */
  xpBaseNivel: 100,
  xpIncrementoPorNivel: 60,
} as const;

const limitar = (valor: number): number => Math.max(0, Math.min(100, valor));

const arredondar = (valor: number): number => Math.round(valor * 10) / 10;

/** Cria o pet inicial de uma conta recém-cadastrada. */
export function criarPet(uid: string, nome: string, agora: Instante): Pet {
  return {
    uid,
    nome,
    nivel: 1,
    xp: 0,
    necessidades: { saude: 80, saciedade: 70, felicidade: 80 },
    atualizadoEm: agora,
    dormeAte: null,
    itensEquipados: [],
    alimentosDesbloqueados: [...ALIMENTOS_INICIAIS],
    criadoEm: agora,
  };
}

/** XP necessário para avançar do nível informado para o seguinte. */
export function xpParaProximoNivel(nivel: number): number {
  return REGRAS.xpBaseNivel + Math.max(0, nivel - 1) * REGRAS.xpIncrementoPorNivel;
}

/**
 * Quanto a saúde varia num intervalo, dado o quanto o pet estava saciado no
 * início. A saciedade cai linearmente, então o intervalo se divide em até três
 * faixas: bem alimentado, neutro e com fome. Integramos cada faixa em vez de
 * simular passo a passo — o resultado é exato e independe da frequência com
 * que o app é aberto.
 */
function variacaoDeSaude(saciedadeInicial: number, decorridoMs: number): number {
  if (decorridoMs <= 0) return 0;

  const horas = decorridoMs / HORA;
  const quedaPorHora = 100 / (REGRAS.saciedadeZeraEm / HORA);

  const horasAte = (alvo: number): number =>
    saciedadeInicial <= alvo ? 0 : Math.min(horas, (saciedadeInicial - alvo) / quedaPorHora);

  const horasBemAlimentado = horasAte(REGRAS.limiarSaciado);
  const horasAteFome = horasAte(REGRAS.limiarFome);
  const horasComFome = horas - horasAteFome;

  return (
    horasBemAlimentado * REGRAS.saudeGanhoPorHoraSaciado -
    horasComFome * REGRAS.saudePerdaPorHoraComFome
  );
}

/**
 * Projeta as necessidades do pet até `agora`. Idempotente: chamar duas vezes
 * com o mesmo instante devolve o mesmo resultado.
 */
export function projetar(pet: Pet, agora: Instante): Pet {
  const decorrido = agora - pet.atualizadoEm;
  if (decorrido <= 0) return pet;

  const { saude, saciedade, felicidade } = pet.necessidades;

  const necessidades: Necessidades = {
    saciedade: limitar(arredondar(saciedade - (decorrido / REGRAS.saciedadeZeraEm) * 100)),
    felicidade: limitar(arredondar(felicidade - (decorrido / REGRAS.felicidadeZeraEm) * 100)),
    saude: limitar(arredondar(saude + variacaoDeSaude(saciedade, decorrido))),
  };

  return {
    ...pet,
    necessidades,
    atualizadoEm: agora,
    dormeAte: pet.dormeAte != null && pet.dormeAte > agora ? pet.dormeAte : null,
  };
}

/** Estado visual do porquinho. Derivado — nunca persistido. */
export function estadoDoPet(pet: Pet, agora: Instante): EstadoPet {
  if (pet.dormeAte != null && pet.dormeAte > agora) return 'dormindo';

  const { saude, saciedade, felicidade } = projetar(pet, agora).necessidades;

  if (saude < 30 || felicidade < 25) return 'triste';
  if (saciedade < REGRAS.limiarFome) return 'faminto';
  if (felicidade >= 70 && saciedade >= REGRAS.limiarSaciado) return 'feliz';
  return 'normal';
}

/** Quanto falta da soneca, em milissegundos. Zero se o pet estiver acordado. */
export function sonecaRestante(pet: Pet, agora: Instante): number {
  if (pet.dormeAte == null) return 0;
  return Math.max(0, pet.dormeAte - agora);
}

export type MotivoRecusa = 'dormindo' | 'bloqueado';

export interface GanhoDeNivel {
  nivel: number;
  alimentosDesbloqueados: string[];
}

export type ResultadoAlimentar =
  | { ok: false; motivo: MotivoRecusa; pet: Pet }
  | {
      ok: true;
      pet: Pet;
      /** Variação real aplicada, já considerando o teto de 100. */
      ganhos: Necessidades;
      adormeceu: boolean;
      ganhoDeNivel: GanhoDeNivel | null;
    };

/**
 * Oferece um alimento ao pet.
 *
 * Recusa se o pet estiver dormindo (o Figma mostra o card "Dorminhoco" com
 * contagem regressiva) ou se o alimento ainda não estiver liberado — a
 * validação mora aqui, e não na tela, para que nenhuma futura entrada
 * (deep link, presente de amigo, aba do responsável) consiga burlá-la.
 */
export function alimentar(pet: Pet, alimento: Alimento, agora: Instante): ResultadoAlimentar {
  if (sonecaRestante(pet, agora) > 0) {
    return { ok: false, motivo: 'dormindo', pet };
  }

  const liberado = alimentosDisponiveis(pet.nivel, pet.alimentosDesbloqueados).some(
    (a) => a.id === alimento.id,
  );
  if (!liberado) {
    return { ok: false, motivo: 'bloqueado', pet };
  }

  const projetado = projetar(pet, agora);
  const antes = projetado.necessidades;

  const necessidades: Necessidades = {
    saude: limitar(antes.saude + (alimento.efeito.saude ?? 0)),
    saciedade: limitar(antes.saciedade + (alimento.efeito.saciedade ?? 0)),
    felicidade: limitar(antes.felicidade + (alimento.efeito.felicidade ?? 0)),
  };

  const adormeceu = necessidades.saciedade >= REGRAS.saciedadeParaDormir;

  const comXp = aplicarXp({ ...projetado, necessidades }, alimento.xp);

  return {
    ok: true,
    pet: {
      ...comXp.pet,
      dormeAte: adormeceu ? agora + REGRAS.duracaoSoneca : projetado.dormeAte,
    },
    ganhos: {
      saude: arredondar(necessidades.saude - antes.saude),
      saciedade: arredondar(necessidades.saciedade - antes.saciedade),
      felicidade: arredondar(necessidades.felicidade - antes.felicidade),
    },
    adormeceu,
    ganhoDeNivel: comXp.ganhoDeNivel,
  };
}

/**
 * Soma XP e resolve quantos níveis isso representa. O laço cobre o caso de um
 * ganho grande atravessar mais de um nível de uma vez (presente de amigo, por
 * exemplo), sem perder o excedente.
 */
function aplicarXp(pet: Pet, xp: number): { pet: Pet; ganhoDeNivel: GanhoDeNivel | null } {
  let nivel = pet.nivel;
  let acumulado = pet.xp + xp;
  let subiu = false;

  while (acumulado >= xpParaProximoNivel(nivel)) {
    acumulado -= xpParaProximoNivel(nivel);
    nivel += 1;
    subiu = true;
  }

  if (!subiu) {
    return { pet: { ...pet, xp: acumulado }, ganhoDeNivel: null };
  }

  const jaTinha = new Set(pet.alimentosDesbloqueados);
  const novos = alimentosDisponiveis(nivel, pet.alimentosDesbloqueados)
    .map((a) => a.id)
    .filter((id) => !jaTinha.has(id));

  return {
    pet: {
      ...pet,
      nivel,
      xp: acumulado,
      alimentosDesbloqueados: [...pet.alimentosDesbloqueados, ...novos],
    },
    ganhoDeNivel: { nivel, alimentosDesbloqueados: novos },
  };
}

/**
 * Registra que a criança abriu o app. Concede o bônus de felicidade no máximo
 * uma vez por dia civil, comparando pelo fuso do dispositivo — é o calendário
 * que a criança enxerga, não UTC.
 */
export function registrarVisita(pet: Pet, agora: Instante): Pet {
  const projetado = projetar(pet, agora);
  if (mesmoDia(pet.atualizadoEm, agora)) return projetado;

  return {
    ...projetado,
    necessidades: {
      ...projetado.necessidades,
      felicidade: limitar(projetado.necessidades.felicidade + REGRAS.bonusVisitaDiaria),
    },
  };
}

function mesmoDia(a: Instante, b: Instante): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** Progresso de 0 a 1 dentro do nível atual, para a barra de XP do HUD. */
export function progressoDoNivel(pet: Pet): number {
  return Math.min(1, pet.xp / xpParaProximoNivel(pet.nivel));
}

/** Troca os acessórios em uso. A validação de nível mora em `src/domain/itens`. */
export function definirItens(pet: Pet, ids: readonly string[]): Pet {
  return { ...pet, itensEquipados: [...ids] };
}

/** Renomeia o pet, sem tocar em mais nada do estado. */
export function renomear(pet: Pet, nome: string): Pet {
  return { ...pet, nome: nome.trim() };
}
