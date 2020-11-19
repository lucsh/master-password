const purgecss = require('@fullhuman/postcss-purgecss');
const cssnano = require('cssnano');

module.exports = (ctx) => ({
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    ...(ctx.options.env === 'production'
      ? [
        cssnano({
          preset: 'default',
        }),
        purgecss({
          content: ['./**/*.html'],
          keyframes: true,
          defaultExtractor: (content) => content.match(/[A-z0-9-:/]+/g),
        }),
      ]
      : []),
  ],
});
