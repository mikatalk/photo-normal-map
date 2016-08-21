'use strict';

const Path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CombineLoaders = require( 'webpack-combine-loaders' );
const extractSASS = new ExtractTextPlugin('css/bundle.css');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const glob = require('glob');

module.exports = (options) => {

  let sourcePath = Path.resolve( __dirname, 'src' );
  // let threejsExamplesPath = Path.resolve( __dirname, './node_modules/three/examples/js' );
  let vendorPath = Path.resolve( __dirname, 'src/libs' );

  let webpackConfig = {
    
    devtool: options.devtool,
    
    entry: [
      `webpack-dev-server/client?http://localhost:${options.port}`,
      'webpack/hot/dev-server',
      './src/js/Main'
    ],
    
    resolve: {
      root: [
        vendorPath,
        sourcePath
      ]
    },

    output: {
      path: Path.join(__dirname, 'dist' ),
      filename: 'js/bundle.js'
    },

    plugins: [
      // environement variables
      new Webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(options.isProduction ? 'production' : 'development')
        }
      }),
      // html
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      // SASS
      extractSASS,
      // Copy Assets
      new CopyWebpackPlugin([
            { from: Path.join(__dirname, 'src/img' ), to: Path.join(__dirname, 'dist/img' ) },
        ], {
            ignore: [
                '*.txt',
                '.*'
            ],
            copyUnmodified: false
        })
    ],
    
    module: {
      loaders: [{
        test: /\.js$/,
        include: [ vendorPath, sourcePath ],
        exclude: /(node_modules|bower_components)/,
        loader: CombineLoaders([
          {
            loader: 'ng-annotate-loader',
            query: {
              add: true
            }
          },
          {
            loader: 'babel-loader',
            query: {
              cacheDirectory: Path.join( __dirname, 'tmp' )
            }
          }
        ]),
      },
      // assets
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        include: [ sourcePath ],
        loader: 'file-loader'
      },
      ]
    }

  };

  if (options.isProduction) {

    // let vendorDependencies = [];
    let vendorDependencies = glob.sync('./libs/**/*.js');
    vendorDependencies.push('three');

    webpackConfig.entry = {
      app: './src/js/Main',
      vendor: vendorDependencies
    };
    webpackConfig.output = {
      path: Path.join(__dirname, 'dist' ),
      filename: 'js/[name].bundle.js'
    }

  
    webpackConfig.plugins.push(
      new Webpack.optimize.OccurenceOrderPlugin(),
      new Webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false
        }
      }),
      new Webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'js/vendor.bundle.js')
    );

    webpackConfig.module.loaders.push({
      test: /\.scss$/i,
      loader: extractSASS.extract(['css', 'sass'])
    });

  } else {

    webpackConfig.plugins.push(
      new Webpack.HotModuleReplacementPlugin()
    );

    webpackConfig.module.loaders.push({
        test: /\.scss$/i,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.js$/,
        loader: 'eslint',
        exclude: /node_modules/
      });

    webpackConfig.devServer = {
      contentBase: './dist',
      hot: true,
      port: options.port,
      inline: true,
      progress: !true
    };
  }

  return webpackConfig;

}