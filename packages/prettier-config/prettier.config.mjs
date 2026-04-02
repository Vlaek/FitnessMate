export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  endOfLine: 'auto',
  printWidth: 100,
  tabWidth: 2,
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],

  // Чтобы сортировщик работал на JS/TS/TSX
  organizeImportsSkipDestructiveCodeActions: true,
};
