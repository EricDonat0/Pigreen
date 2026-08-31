import { defineConfig } from 'vitest/config';

/**
 * A suíte cobre apenas `src/domain`: as regras do jogo e as validações são
 * funções puras, então rodam em Node em milissegundos, sem React Native, sem
 * emulador e sem mock do Firebase. Componentes ficam de fora de propósito —
 * testá-los exigiria toda a infraestrutura que o domínio foi desenhado para
 * dispensar.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      include: ['src/domain/**/*.ts', 'src/i18n/**/*.ts'],
      exclude: ['src/domain/**/*.test.ts'],
    },
  },
});
