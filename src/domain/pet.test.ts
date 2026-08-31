import { describe, expect, it } from 'vitest';
import {
  REGRAS,
  alimentar,
  criarPet,
  estadoDoPet,
  progressoDoNivel,
  projetar,
  registrarVisita,
  sonecaRestante,
  xpParaProximoNivel,
} from './pet';
import { buscarAlimento } from './alimentos';
import type { Pet } from '../types';

const HORA = 3_600_000;
const T0 = Date.UTC(2026, 7, 31, 12, 0, 0);

const arroz = buscarAlimento('arroz')!;
const bolinho = buscarAlimento('bolinho_de_soja')!;

const petCom = (parcial: Partial<Pet>): Pet => ({ ...criarPet('u1', 'Porquinho', T0), ...parcial });

describe('projetar', () => {
  it('não altera o pet quando nenhum tempo passou', () => {
    const pet = criarPet('u1', 'Porquinho', T0);
    expect(projetar(pet, T0)).toBe(pet);
  });

  it('ignora relógio que anda para trás', () => {
    const pet = criarPet('u1', 'Porquinho', T0);
    expect(projetar(pet, T0 - HORA)).toBe(pet);
  });

  it('esvazia a saciedade exatamente na janela configurada', () => {
    const pet = petCom({ necessidades: { saude: 50, saciedade: 100, felicidade: 50 } });
    const depois = projetar(pet, T0 + REGRAS.saciedadeZeraEm);
    expect(depois.necessidades.saciedade).toBe(0);
  });

  it('é idempotente: um passo grande equivale a vários pequenos', () => {
    const pet = petCom({ necessidades: { saude: 60, saciedade: 100, felicidade: 90 } });

    const deUmaVez = projetar(pet, T0 + 6 * HORA).necessidades;
    let passoAPasso = pet;
    for (let h = 1; h <= 6; h += 1) passoAPasso = projetar(passoAPasso, T0 + h * HORA);

    expect(passoAPasso.necessidades.saude).toBeCloseTo(deUmaVez.saude, 0);
    expect(passoAPasso.necessidades.saciedade).toBeCloseTo(deUmaVez.saciedade, 0);
    expect(passoAPasso.necessidades.felicidade).toBeCloseTo(deUmaVez.felicidade, 0);
  });

  it('ganha saúde enquanto está bem alimentado', () => {
    const pet = petCom({ necessidades: { saude: 50, saciedade: 100, felicidade: 50 } });
    // 100 -> 60 leva ~4.8h; nesse trecho a saúde só sobe.
    const depois = projetar(pet, T0 + 4 * HORA);
    expect(depois.necessidades.saude).toBeGreaterThan(50);
  });

  it('perde saúde depois de muito tempo com fome', () => {
    const pet = petCom({ necessidades: { saude: 80, saciedade: 10, felicidade: 50 } });
    const depois = projetar(pet, T0 + 8 * HORA);
    expect(depois.necessidades.saciedade).toBe(0);
    expect(depois.necessidades.saude).toBeLessThan(80);
  });

  it('nunca sai da faixa 0–100', () => {
    const pet = petCom({ necessidades: { saude: 5, saciedade: 5, felicidade: 5 } });
    const depois = projetar(pet, T0 + 400 * HORA).necessidades;
    for (const valor of Object.values(depois)) {
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThanOrEqual(100);
    }
  });
});

describe('alimentar', () => {
  it('aumenta a saciedade e concede XP', () => {
    const pet = petCom({ necessidades: { saude: 50, saciedade: 40, felicidade: 50 } });
    const r = alimentar(pet, arroz, T0);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pet.necessidades.saciedade).toBeCloseTo(40 + arroz.efeito.saciedade!, 1);
    expect(r.pet.xp).toBe(arroz.xp);
  });

  it('reporta o ganho real, não o nominal, quando bate no teto', () => {
    const pet = petCom({ necessidades: { saude: 50, saciedade: 95, felicidade: 50 } });
    const r = alimentar(pet, arroz, T0);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pet.necessidades.saciedade).toBe(100);
    expect(r.ganhos.saciedade).toBe(5);
  });

  it('faz o pet dormir quando fica quase cheio', () => {
    const pet = petCom({ necessidades: { saude: 50, saciedade: 80, felicidade: 50 } });
    const r = alimentar(pet, arroz, T0);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.adormeceu).toBe(true);
    expect(sonecaRestante(r.pet, T0)).toBe(REGRAS.duracaoSoneca);
    expect(estadoDoPet(r.pet, T0)).toBe('dormindo');
  });

  it('recusa alimento enquanto o pet dorme', () => {
    const pet = petCom({ dormeAte: T0 + 10 * 60_000 });
    const r = alimentar(pet, arroz, T0);

    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toBe('dormindo');
    expect(r.pet).toBe(pet);
  });

  it('acorda sozinho quando a soneca termina', () => {
    const pet = petCom({ dormeAte: T0 + 10 * 60_000 });
    expect(estadoDoPet(pet, T0 + 11 * 60_000)).not.toBe('dormindo');
    expect(alimentar(pet, arroz, T0 + 11 * 60_000).ok).toBe(true);
  });

  it('recusa alimento ainda bloqueado no nível atual', () => {
    const pet = petCom({ nivel: 1, alimentosDesbloqueados: ['arroz'] });
    const r = alimentar(pet, bolinho, T0);

    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toBe('bloqueado');
  });
});

describe('progressão de nível', () => {
  it('sobe de nível e desbloqueia os alimentos do novo nível', () => {
    const pet = petCom({
      nivel: 1,
      xp: xpParaProximoNivel(1) - arroz.xp,
      necessidades: { saude: 50, saciedade: 20, felicidade: 50 },
    });
    const r = alimentar(pet, arroz, T0);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.ganhoDeNivel?.nivel).toBe(2);
    expect(r.pet.nivel).toBe(2);
    expect(r.pet.xp).toBe(0);
    expect(r.ganhoDeNivel?.alimentosDesbloqueados).toContain('bolinho_de_soja');
    expect(r.pet.alimentosDesbloqueados).toContain('inhame');
  });

  it('preserva o XP excedente ao subir de nível', () => {
    const pet = petCom({ nivel: 1, xp: xpParaProximoNivel(1) - 1 });
    const r = alimentar(pet, arroz, T0);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.pet.xp).toBe(arroz.xp - 1);
  });

  it('exige mais XP a cada nível', () => {
    expect(xpParaProximoNivel(2)).toBeGreaterThan(xpParaProximoNivel(1));
    expect(xpParaProximoNivel(3)).toBeGreaterThan(xpParaProximoNivel(2));
  });

  it('progresso fica entre 0 e 1', () => {
    expect(progressoDoNivel(petCom({ xp: 0 }))).toBe(0);
    expect(progressoDoNivel(petCom({ nivel: 1, xp: 10_000 }))).toBe(1);
  });
});

describe('estadoDoPet', () => {
  const estado = (n: Partial<Pet['necessidades']>) =>
    estadoDoPet(petCom({ necessidades: { saude: 80, saciedade: 80, felicidade: 80, ...n } }), T0);

  it('feliz quando tudo está alto', () => expect(estado({})).toBe('feliz'));
  it('faminto quando a saciedade cai', () => expect(estado({ saciedade: 10 })).toBe('faminto'));
  it('triste quando a saúde despenca', () => expect(estado({ saude: 10 })).toBe('triste'));
  it('triste quando a felicidade despenca', () => expect(estado({ felicidade: 10 })).toBe('triste'));
  it('tristeza tem prioridade sobre fome', () =>
    expect(estado({ saude: 10, saciedade: 5 })).toBe('triste'));
});

describe('registrarVisita', () => {
  it('dá o bônus de saudade no primeiro acesso de um novo dia', () => {
    const pet = petCom({ necessidades: { saude: 50, saciedade: 50, felicidade: 50 } });
    const amanha = T0 + 26 * HORA;

    const semBonus = projetar(pet, amanha).necessidades.felicidade;
    const comBonus = registrarVisita(pet, amanha).necessidades.felicidade;

    expect(comBonus - semBonus).toBeCloseTo(REGRAS.bonusVisitaDiaria, 1);
  });

  it('não repete o bônus no mesmo dia', () => {
    const pet = petCom({ necessidades: { saude: 50, saciedade: 50, felicidade: 50 } });
    const maisTarde = T0 + 2 * HORA;

    expect(registrarVisita(pet, maisTarde).necessidades.felicidade).toBe(
      projetar(pet, maisTarde).necessidades.felicidade,
    );
  });
});
