//  @ts-check

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',

  tailwindStylesheet: './src/styles.css',
  tailwindFunctions: ['cn', 'cva'],
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
