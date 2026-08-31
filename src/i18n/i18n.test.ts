import { describe, expect, it } from 'vitest';
import { pt } from './pt';
import { en } from './en';
import { es } from './es';
import { criarTradutor, idiomaDoSistema } from './index';
import { ALIMENTOS, chavesDoAlimento } from '../domain/alimentos';
import { NECESSIDADES } from '../domain/necessidades';
import { ITENS } from '../domain/itens';
import { REFEICOES } from '../types';

const DICIONARIOS = { pt, en, es };

describe('dicionários', () => {
  it.each(Object.entries(DICIONARIOS))('%s tem exatamente as chaves do português', (_, dic) => {
    expect(Object.keys(dic).sort()).toEqual(Object.keys(pt).sort());
  });

  it.each(Object.entries(DICIONARIOS))('%s não tem texto vazio', (_, dic) => {
    const vazias = Object.entries(dic)
      .filter(([, valor]) => valor.trim().length === 0)
      .map(([chave]) => chave);
    expect(vazias).toEqual([]);
  });

  /**
   * O maior risco de uma tradução manual é perder um `{placeholder}` — a frase
   * fica plausível e some um dado. Este teste compara os marcadores de cada
   * idioma com os do português.
   */
  it.each(Object.entries(DICIONARIOS))('%s preserva todos os marcadores', (_, dic) => {
    const marcadores = (texto: string) => (texto.match(/\{[a-zA-Z]+\}/g) ?? []).sort();

    for (const chave of Object.keys(pt) as (keyof typeof pt)[]) {
      expect({ chave, m: marcadores(dic[chave]) }).toEqual({
        chave,
        m: marcadores(pt[chave]),
      });
    }
  });
});

describe('cobertura do domínio', () => {
  it('todo alimento do catálogo tem nome e descrição nos três idiomas', () => {
    for (const alimento of ALIMENTOS) {
      const chaves = chavesDoAlimento(alimento.id);
      for (const dic of Object.values(DICIONARIOS)) {
        expect(dic[chaves.nome], `${alimento.id}.nome`).toBeTruthy();
        expect(dic[chaves.descricao], `${alimento.id}.descricao`).toBeTruthy();
      }
    }
  });

  it('toda necessidade tem rótulo e explicação', () => {
    for (const necessidade of NECESSIDADES) {
      expect(pt[necessidade.chaveRotulo]).toBeTruthy();
      expect(pt[necessidade.chaveExplicacao]).toBeTruthy();
    }
  });

  it('todo item de customização tem nome', () => {
    for (const item of ITENS) expect(pt[item.chaveNome]).toBeTruthy();
  });

  it('toda refeição tem rótulo', () => {
    for (const refeicao of REFEICOES) {
      expect(pt[`refeicao.${refeicao}` as keyof typeof pt]).toBeTruthy();
    }
  });
});

describe('criarTradutor', () => {
  it('devolve o texto do idioma pedido', () => {
    expect(criarTradutor('en')('login.entrar')).toBe('Enter the app');
    expect(criarTradutor('es')('login.entrar')).toBe('Entrar en la app');
  });

  it('interpola os valores', () => {
    expect(criarTradutor('pt')('jogo.nivelCurto', { nivel: 3 })).toBe('Nível 3');
  });

  it('substitui todas as ocorrências do mesmo marcador', () => {
    const t = criarTradutor('pt');
    expect(t('jogo.subiuNivel', { nome: 'Rex', nivel: 2 })).toBe('Rex chegou ao nível 2!');
  });

  it('deixa marcador desconhecido intacto em vez de imprimir "undefined"', () => {
    expect(criarTradutor('pt')('jogo.nivelCurto')).toBe('Nível {nivel}');
  });
});

describe('idiomaDoSistema', () => {
  it.each([
    [['pt-BR'], 'pt'],
    [['en-US'], 'en'],
    [['es-419'], 'es'],
    [['de-DE', 'en-GB'], 'en'],
    [['ja-JP'], 'pt'],
    [[], 'pt'],
  ])('%s vira %s', (tags, esperado) => {
    expect(idiomaDoSistema(tags)).toBe(esperado);
  });
});
