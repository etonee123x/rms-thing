module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    'plugin:import/errors',
    'plugin:import/warnings',
    '@vue/typescript/recommended',
  ],
  plugins: ['import', 'html', 'json', 'vue', 'prettier'],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    strict: 0,
    'prettier/prettier': 'warn',
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    'import/extensions': [
      'warn',
      'always',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.js', '.jsx', '.json', '.vue'],
      },
    },
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
};
