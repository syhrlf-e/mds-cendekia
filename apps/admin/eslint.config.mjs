import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: [
    'REFERENSI/**',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'prefer-const': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/attributes-order': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/html-self-closing': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-required-prop-with-default': 'off',
    'vue/require-default-prop': 'off',
    'vue/v-on-event-hyphenation': 'off',
  },
})
