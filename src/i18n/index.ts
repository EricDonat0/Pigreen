import { pt } from './pt';
import { en } from './en';
import { es } from './es';
import type { ChaveTraducao } from './pt';

export type { ChaveTraducao };

export type Idioma = 'pt' | 'en' | 'es';

export const IDIOMAS: readonly { codigo: Idioma; chaveRotulo: ChaveTraducao }[] = [
  { codigo: 'pt', chaveRotulo: 'idioma.pt' },
  { codigo: 'en', chaveRotulo: 'idioma.en' },
  { codigo: 'es', chaveRotulo: 'idioma.es' },
];

const DICIONARIOS: Record<Idioma, Record<ChaveTraducao, string>> = { pt, en, es };

export type Tradutor = (chave: ChaveTraducao, valores?: Record<string, string | number>) => string;

/**
 * Monta o tradutor de um idioma.
 *
 * Interpolação simples com `{nome}`. Não há plural nem gênero: as frases do
 * app foram escritas para evitar os dois, o que dispensa uma biblioteca de
 * i18n inteira num projeto deste tamanho.
 */
export function criarTradutor(idioma: Idioma): Tradutor {
  const dicionario = DICIONARIOS[idioma] ?? pt;

  return (chave, valores) => {
    const bruto = dicionario[chave] ?? pt[chave] ?? chave;
    if (!valores) return bruto;

    return Object.entries(valores).reduce(
      (texto, [nome, valor]) => texto.split(`{${nome}}`).join(String(valor)),
      bruto,
    );
  };
}

/** Resolve o idioma do app a partir das tags de idioma do sistema. */
export function idiomaDoSistema(tags: readonly string[]): Idioma {
  for (const tag of tags) {
    const base = tag.toLowerCase().split('-')[0];
    if (base === 'pt' || base === 'en' || base === 'es') return base;
  }
  return 'pt';
}
