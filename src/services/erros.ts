import type { ChaveTraducao } from '../i18n';

/**
 * Tradução de códigos do Firebase para chaves de mensagem.
 *
 * Devolve uma *chave*, não um texto: assim a mesma falha aparece no idioma
 * escolhido pelo usuário, e a camada de serviço continua sem saber nada sobre
 * apresentação.
 */

const CONHECIDOS = new Set<string>([
  'auth/invalid-email',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/email-already-in-use',
  'auth/weak-password',
  'auth/too-many-requests',
  'auth/network-request-failed',
  'auth/missing-password',
  'auth/requires-recent-login',
  'permission-denied',
  'unavailable',
]);

export function codigoDoErro(erro: unknown): string | null {
  if (typeof erro === 'object' && erro !== null && 'code' in erro) {
    const codigo = (erro as { code: unknown }).code;
    if (typeof codigo === 'string') return codigo;
  }
  return null;
}

export function chaveDeErro(erro: unknown): ChaveTraducao {
  const codigo = codigoDoErro(erro);

  if (codigo && CONHECIDOS.has(codigo)) {
    return `erro.${codigo}` as ChaveTraducao;
  }

  if (__DEV__) {
    console.warn('[Pigreen] erro sem tradução:', codigo ?? erro);
  }
  return 'erro.padrao';
}
