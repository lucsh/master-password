const path = require('path'),
  webpack = require('webpack'),
  CleanWebpackPlugin = require('clean-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const extractPlugin = new ExtractTextPlugin({ filename: './assets/css/app.css' });

const config = {

  // absolute path for project root with the 'src' folder
  context: path.resolve(__dirname, 'src'),

  entry: {
    // relative path declaration
    app: './app.js',
  },

  output: {
    // absolute path declaration
    path: path.resolve(__dirname, 'dist'),
    filename: './assets/js/[name].bundle.js',
  },

  module: {
    rules: [

      // babel-loader with 'env' preset
      {
        test: /\.js$/, include: /src/, exclude: /node_modules/, use: { loader: 'babel-loader', options: { presets: ['env'] } },
      },
      // html-loader
      { test: /\.html$/, use: ['html-loader'] },
      // sass-loader with sourceMap activated
      {
        test: /\.scss$/,
        include: [path.resolve(__dirname, 'src', 'assets', 'scss')],
        use: extractPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
          fallback: 'style-loader',
        }),
      },
      // file-loader(for images)
      { test: /\.(jpg|png|gif|svg)$/, use: [{ loader: 'file-loader', options: { name: '[name].[ext]', outputPath: './assets/media/' } }] },
      // file-loader(for fonts)
      { test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader'] },

    ],
  },

  plugins: [
    // cleaning up only 'dist' folder
    new CleanWebpackPlugin(['dist']),
    new FaviconsWebpackPlugin({
      // Your source logo
      logo: './assets/logo/logo.png',
      // Generate a cache file with control hashes and
      // don't rebuild the favicons until those hashes change
      persistentCache: true,
      // Inject the html into the html-webpack-plugin
      inject: true,
      // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
      background: '#fff',
      // favicon app title (see https://github.com/haydenbleasel/favicons#usage)
      title: 'Secure Password Generator',

      // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        coast: false,
        favicons: true,
        firefox: true,
        opengraph: true,
        twitter: true,
        yandex: false,
        windows: true,
      }
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new CopyWebpackPlugin([
      { from: 'assets/htaccess', to: './.htaccess', toType: 'file' },
    ]),
    // extract-text-webpack-plugin instance
    extractPlugin,
  ],

  devServer: {
    // static files served from here
    contentBase: path.resolve(__dirname, './dist/assets/media'),
    compress: true,
    // open app in localhost:2000
    port: 2000,
    stats: 'errors-only',
    open: true,
  },

  // devtool: 'inline-source-map',

};

module.exports = config;
