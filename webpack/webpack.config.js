// Libraries
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { NODE_ENV } = process.env

// Configuration
module.exports = env => {

  return {
    context: path.resolve(__dirname, '../examples'),
    entry: {
      app: ['@babel/polyfill', './example.js']
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      publicPath: NODE_ENV === 'prod' ? '': '/',
      filename: 'assets/js/[name].[hash:7].bundle.js'
    },
    devServer: {
      contentBase: path.resolve(__dirname, '../examples'),
      publicPath: '/',
    },
    resolve: {
      extensions: ['.js'],
      alias: {
        source: path.resolve(__dirname, '../examples'), // Relative path of src
        images: path.resolve(__dirname, '../examples/assets/images'), // Relative path of images
      }
    },

    /*
      Loaders with their configurations
    */
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: { presets: ['@babel/preset-env'] }
            }
          ]
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          })
        },
        {
          use: 'css-loader!sass-loader?sourceMap',
          test: /\.(sass|scss)$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  sourceMap: true,
                  minimize: false,
                }
              },
              'postcss-loader?sourceMap',
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                  expanded: true,
                }
              }
            ]
          })
        },
        {
          test: /\.pug$/,
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: true,
              }
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 3000,
            name: 'assets/images/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 5000,
            name: 'assets/fonts/[name].[ext]'
          }
        },
        {
          test: /\.(mp4)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'assets/videos/[name].[hash:7].[ext]'
          }
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin([
      ]),
      // // Desktop page
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'index.pug',
        inject: true
      }),
      new WebpackNotifierPlugin({
        title: 'Data linked'
      })
    ]
  }
}
