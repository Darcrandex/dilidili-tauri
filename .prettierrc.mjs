/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
export default {
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  printWidth: 120,
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
}
