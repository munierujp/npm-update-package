module.exports = {
  extends: [
    '@npm-update-package/eslint-config-typescript',
    'plugin:jest/recommended'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  plugins: [
    'sonarjs'
  ],
  rules: {
    'no-console': 'error',
    'sonarjs/max-switch-cases': 'error',
    'sonarjs/no-collapsible-if': 'error',
    'sonarjs/no-element-overwrite': 'error',
    'sonarjs/no-empty-collection': 'error',
    'sonarjs/no-extra-arguments': 'error',
    'sonarjs/no-ignored-return': 'error'
  }
}
