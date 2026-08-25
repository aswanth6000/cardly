const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const path = require('node:path');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', 'apps/mobile/.expo/*', 'apps/mobile/android/*', 'apps/mobile/ios/*'],
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
      },
    },
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: path.join(__dirname, 'apps/mobile/tsconfig.json'),
        },
        node: {
          paths: [path.join(__dirname, 'apps/mobile')],
        },
      },
    },
  },
  {
    rules: {
      // Sensitive values must never leak into logs.
      'no-console': 'warn',
    },
  },
]);
