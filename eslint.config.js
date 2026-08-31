// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'expo-env.d.ts'],
  },
  {
    rules: {
      // O domínio é escrito em português; nomes de variáveis com acento são
      // intencionais e não devem virar aviso.
      'import/no-unresolved': 'off',
    },
  },
]);
