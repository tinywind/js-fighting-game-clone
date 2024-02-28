module.exports = {
  root: true,
  plugins: ['node', 'prettier', '@typescript-eslint'],
  extends: ['eslint:recommended', 'prettier', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // 'parser': 'espree',
    allowImportExportEverywhere: true,
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  globals: {
    JSX: true,
  },
  settings: {
    'eslint.validate': ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'vue', 'markdown'],
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': true,
    },
    'import/resolver': {
      node: {
        paths: [''],
      },
    },
  },
  ignorePatterns: ['node_modules/'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        singleQuote: true,
        jsxSingleQuote: true,
        bracketSameLine: true,
        proseWrap: 'preserve',
        quoteProps: 'as-needed',
        semi: true,
        tabWidth: 2,
        trailingComma: 'all',
        useTabs: false,
        printWidth: 200,
        bracketSpacing: true,
        arrowParens: 'avoid',
        vueIndentScriptAndStyle: false,
      },
      { usePrettierrc: true },
    ],
    'no-param-reassign': 0,
    'no-shadow': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-explicit-any': 0,
  },
};
