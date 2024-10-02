import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    languageOptions: {
      globals: {...globals.browser, ...globals.jest, ...globals.node},
    },
  },
  {
    ignores: [
      'node-modules/*',
      'dist/*',
      'src/js/__test__/*',
      'eslint.config.mjs',
    ],
  },
  pluginJs.configs.recommended,
];
