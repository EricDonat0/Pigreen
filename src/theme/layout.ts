/**
 * Métricas de layout. Escala de espaçamento em base 4, arredondamentos
 * generosos e alvos de toque acima do mínimo recomendado — mãos pequenas
 * erram mais o alvo do que mãos adultas.
 */

export const espacos = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const raios = {
  pequeno: 8,
  medio: 16,
  grande: 24,
  sheet: 40,
  pilula: 999,
} as const;

/** Alvo mínimo de toque (WCAG 2.2 pede 24px; usamos 48 por ser app infantil). */
export const alvoToque = 48;

export const sombras = {
  cartao: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  flutuante: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
