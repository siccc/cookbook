/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
  ],
  "vue/multi-word-component-names": ["error", {
    "ignores": []
  }],
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    'max-len': ['error', {
      code: 100,
      ignoreTemplateLiterals: true
    }],
    'vue/no-undef-components': ['error']
  },
  parserOptions: {
    ecmaVersion: 'latest'
  }
};
