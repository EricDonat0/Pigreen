import { describe, expect, it } from 'vitest';
import {
  FormularioCadastro,
  avaliarSenha,
  emailValido,
  paraIsoCurto,
  semErros,
  validarCadastro,
} from './validacao';

const AGORA = new Date(2026, 7, 31);

const formValido: FormularioCadastro = {
  nomeResponsavel: 'Maria da Silva',
  nomeCrianca: 'Clara da Silva',
  email: 'maria@exemplo.com',
  confirmacaoEmail: 'maria@exemplo.com',
  senha: 'Pigreen2026',
  confirmacaoSenha: 'Pigreen2026',
  nascimentoCrianca: new Date(2019, 3, 12),
  dieta: 'vegetariano',
};

describe('avaliarSenha', () => {
  it('rejeita senha curta', () => {
    expect(avaliarSenha('abc').aceitavel).toBe(false);
  });

  it('rejeita senha longa sem variedade', () => {
    expect(avaliarSenha('aaaaaaaaaa').aceitavel).toBe(false);
  });

  it('aceita senha média', () => {
    const r = avaliarSenha('pigreen1');
    expect(r.aceitavel).toBe(true);
    expect(r.forca).toBe('media');
  });

  it('classifica como forte quando é longa e variada', () => {
    expect(avaliarSenha('Pigreen2026!').forca).toBe('forte');
  });
});

describe('emailValido', () => {
  it.each(['a@b.co', ' maria@exemplo.com '])('aceita %s', (email) => {
    expect(emailValido(email)).toBe(true);
  });

  it.each(['maria', 'maria@', '@exemplo.com', 'maria @exemplo.com', 'maria@exemplo'])(
    'rejeita %s',
    (email) => {
      expect(emailValido(email)).toBe(false);
    },
  );
});

describe('validarCadastro', () => {
  it('não acusa erro num formulário completo', () => {
    expect(semErros(validarCadastro(formValido, AGORA))).toBe(true);
  });

  it('acusa e-mails divergentes', () => {
    const erros = validarCadastro(
      { ...formValido, confirmacaoEmail: 'outro@exemplo.com' },
      AGORA,
    );
    expect(erros.confirmacaoEmail).toBeDefined();
  });

  it('ignora diferença de caixa na confirmação de e-mail', () => {
    const erros = validarCadastro(
      { ...formValido, confirmacaoEmail: 'MARIA@Exemplo.com' },
      AGORA,
    );
    expect(erros.confirmacaoEmail).toBeUndefined();
  });

  it('acusa senhas divergentes', () => {
    const erros = validarCadastro({ ...formValido, confirmacaoSenha: 'outra123' }, AGORA);
    expect(erros.confirmacaoSenha).toBeDefined();
  });

  it('não reclama da confirmação quando a própria senha é inválida', () => {
    const erros = validarCadastro(
      { ...formValido, senha: 'abc', confirmacaoSenha: 'abc' },
      AGORA,
    );
    expect(erros.senha).toBeDefined();
    expect(erros.confirmacaoSenha).toBeUndefined();
  });

  it('rejeita data de nascimento no futuro', () => {
    const erros = validarCadastro(
      { ...formValido, nascimentoCrianca: new Date(2027, 0, 1) },
      AGORA,
    );
    expect(erros.nascimentoCrianca).toBeDefined();
  });

  it('sinaliza ano de nascimento improvável', () => {
    const erros = validarCadastro(
      { ...formValido, nascimentoCrianca: new Date(1990, 0, 1) },
      AGORA,
    );
    expect(erros.nascimentoCrianca).toBeDefined();
  });

  it('exige a escolha de dieta', () => {
    expect(validarCadastro({ ...formValido, dieta: null }, AGORA).dieta).toBeDefined();
  });

  it('exige os dois nomes', () => {
    const erros = validarCadastro(
      { ...formValido, nomeResponsavel: ' ', nomeCrianca: '' },
      AGORA,
    );
    expect(erros.nomeResponsavel).toBeDefined();
    expect(erros.nomeCrianca).toBeDefined();
  });
});

describe('paraIsoCurto', () => {
  it('formata com zero à esquerda e sem fuso', () => {
    expect(paraIsoCurto(new Date(2019, 3, 5))).toBe('2019-04-05');
  });
});
