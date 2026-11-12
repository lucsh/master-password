const cssnano = require('cssnano');

module.exports = (ctx) => ({
  plugins: [
    require('autoprefixer'),
    ...(ctx.options.env === 'production'
      ? [cssnano({ preset: 'default' })]
      : []),
  ],
});
