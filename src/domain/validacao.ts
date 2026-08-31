import type { ChaveTraducao } from '../i18n';
import type { PerfilDieta } from '../types';

/**
 * Validação dos formulários de autenticação.
 *
 * Puro e sem dependência de React: a mesma função valida o formulário na tela
 * e é coberta por testes unitários. Devolve *chaves de tradução*, não frases —
 * é o que permite ao mesmo formulário falar português, inglês e espanhol sem
 * duplicar a regra.
 */

/** Deliberadamente permissivo: e-mail só é validado de verdade pelo envio. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ForcaSenha = 'fraca' | 'media' | 'forte';

export interface AvaliacaoSenha {
  forca: ForcaSenha;
  chaveRotulo: ChaveTraducao;
  /** `false` enquanto a senha não atender ao mínimo aceito no cadastro. */
  aceitavel: boolean;
}

export function avaliarSenha(senha: string): AvaliacaoSenha {
  if (senha.length < 6) {
    return { forca: 'fraca', chaveRotulo: 'validacao.senhaCurta', aceitavel: false };
  }

  const variedade = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(senha)).length;

  if (senha.length >= 10 && variedade >= 3) {
    return { forca: 'forte', chaveRotulo: 'validacao.senhaForte', aceitavel: true };
  }
  if (variedade >= 2) {
    return { forca: 'media', chaveRotulo: 'validacao.senhaMedia', aceitavel: true };
  }
  return { forca: 'fraca', chaveRotulo: 'validacao.senhaFraca', aceitavel: false };
}

export function emailValido(email: string): boolean {
  return EMAIL.test(email.trim());
}

export interface FormularioCadastro {
  nomeResponsavel: string;
  nomeCrianca: string;
  email: string;
  confirmacaoEmail: string;
  senha: string;
  confirmacaoSenha: string;
  nascimentoCrianca: Date | null;
  dieta: PerfilDieta | null;
}

/** Erros por campo. Um campo ausente do objeto está válido. */
export type ErrosCadastro = Partial<Record<keyof FormularioCadastro, ChaveTraducao>>;

/**
 * Idade máxima aceita para a criança. Não é uma trava de segurança — é uma
 * defesa contra erro de digitação no ano (o caso comum é digitar o ano atual
 * ou o ano de nascimento do responsável).
 */
const IDADE_MAXIMA_ANOS = 18;

export function validarCadastro(
  form: FormularioCadastro,
  agora: Date = new Date(),
): ErrosCadastro {
  const erros: ErrosCadastro = {};

  if (form.nomeResponsavel.trim().length < 2) {
    erros.nomeResponsavel = 'validacao.nomeResponsavel';
  }
  if (form.nomeCrianca.trim().length < 2) {
    erros.nomeCrianca = 'validacao.nomeCrianca';
  }

  if (!emailValido(form.email)) {
    erros.email = 'validacao.email';
  } else if (form.email.trim().toLowerCase() !== form.confirmacaoEmail.trim().toLowerCase()) {
    erros.confirmacaoEmail = 'validacao.emailDiferente';
  }

  const senha = avaliarSenha(form.senha);
  if (!senha.aceitavel) {
    erros.senha = senha.chaveRotulo;
  } else if (form.senha !== form.confirmacaoSenha) {
    erros.confirmacaoSenha = 'validacao.senhaDiferente';
  }

  Object.assign(erros, validarNascimento(form.nascimentoCrianca, agora));

  if (!form.dieta) {
    erros.dieta = 'validacao.dieta';
  }

  return erros;
}

/** Reaproveitada pela edição de perfil, que não valida senha nem e-mail. */
export function validarNascimento(
  nascimento: Date | null,
  agora: Date = new Date(),
): { nascimentoCrianca?: ChaveTraducao } {
  if (!nascimento) return { nascimentoCrianca: 'validacao.nascimentoVazio' };

  const limite = new Date(agora);
  limite.setFullYear(limite.getFullYear() - IDADE_MAXIMA_ANOS);

  if (nascimento > agora) return { nascimentoCrianca: 'validacao.nascimentoFuturo' };
  if (nascimento < limite) return { nascimentoCrianca: 'validacao.nascimentoAntigo' };
  return {};
}

export function semErros(erros: ErrosCadastro): boolean {
  return Object.keys(erros).length === 0;
}

/** Converte um `Date` para o ISO curto usado na persistência (`YYYY-MM-DD`). */
export function paraIsoCurto(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** Lê o ISO curto de volta para `Date` local, sem cair no fuso do UTC. */
export function deIsoCurto(iso: string): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!partes) return null;
  return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
}
