// @flow weak
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import WebpackIsomorphicToolsPlugin from 'webpack-isomorphic-tools/plugin';
import autoprefixer from 'autoprefixer';
import config from '../src/server/config';
import constants from './constants';
import ip from 'ip';
import path from 'path';
import webpack from 'webpack';
import webpackIsomorphicAssets from './assets';

const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(webpackIsomorphicAssets);

// github.com/facebookincubator/create-react-app/issues/343#issuecomment-237241875
// You may want 'cheap-module-source-map' instead if you prefer source maps.
const devtools = 'eval';

const serverIp = config.remoteHotReload
  ? ip.address() // Dynamic IP address enables hot reload on remote devices.
  : 'localhost';

const makeConfig = options => {
  const {
    isDevelopment,
  } = options;

  function scssLoaders() {
    return 'css-loader?sourceMap&modules&importLoaders=1' +
      '&localIdentName=[name]__[local]___[hash:base64:5]' +
      '!postcss-loader!sass-loader?sourceMap!toolbox-loader';
  }

  function cssLoaders() {
    return 'css-loader?sourceMap!postcss-loader';
  }

  const config = {
    hotPort: constants.HOT_RELOAD_PORT,
    cache: isDevelopment,
    debug: isDevelopment,
    devtool: isDevelopment ? devtools : '',
    entry: {
      app: isDevelopment ? [ // @formatter:off
        `webpack-hot-middleware/client?path=http://${serverIp}:${constants.HOT_RELOAD_PORT}/__webpack_hmr`,
        path.join(constants.SRC_DIR, 'browser/index.js'),
      ] : [
        path.join(constants.SRC_DIR, 'browser/index.js'),
      ], // @formatter:on
    },
    module: {
      noParse: [
        // https://github.com/localForage/localForage/issues/617
        new RegExp('localforage.js'),
        new RegExp('/sockjs-client/dist/sockjs.js'),
      ],
      loaders: [
        {
          loader: 'url-loader?limit=10000',
          test: /\.(gif|jpg|png|svg)(\?.*)?$/,
        }, {
          loader: 'url-loader?limit=1',
          test: /favicon\.ico$/,
        }, {
          loader: 'url-loader?limit=100000',
          test: /\.(ttf|eot|woff|woff2)(\?.*)?$/,
        }, {
          test: /\.js$/,
          exclude: constants.NODE_MODULES_DIR,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            presets: ['es2015', 'react', 'stage-1'],
            plugins: [
              ['transform-runtime', {
                helpers: false,
                polyfill: false,
                regenerator: false,
              }],
            ],
            env: {
              production: {
                plugins: [
                  'transform-react-constant-elements',
                ],
              },
            },
          },
        }, {
          test: /\.scss$/,
          loader: isDevelopment ? `style-loader!${scssLoaders()}`
            : ExtractTextPlugin.extract('style-loader', scssLoaders()),
        }, {
          test: /\.css$/,
          loader: isDevelopment ? `style-loader!${cssLoaders()}`
            : ExtractTextPlugin.extract('style-loader', cssLoaders()),
        },
      ],
    },
    output: isDevelopment ? { // @formatter:off
      path: constants.BUILD_DIR,
      filename: '[name].js',
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: `http://${serverIp}:${constants.HOT_RELOAD_PORT}/build/`,
    } : {
      path: constants.BUILD_DIR,
      filename: '[name]-[hash].js',
      chunkFilename: '[name]-[chunkhash].js',
      publicPath: '/assets/',
    }, // @formatter:on
    plugins: (() => {
      const plugins = [
        new webpack.DefinePlugin({
          'process.env': {
            IS_BROWSER: true, // Because webpack is used only for browser code.
            IS_SERVERLESS: JSON.stringify(process.env.IS_SERVERLESS || false),
            NODE_ENV: JSON.stringify(isDevelopment ? 'development' : 'production'),
            SERVER_URL: JSON.stringify(process.env.SERVER_URL || ''),
          },
        }),
      ];
      if (isDevelopment) {
        plugins.push(
          new webpack.optimize.OccurrenceOrderPlugin(),
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NoErrorsPlugin(),
          webpackIsomorphicToolsPlugin.development(),
        );
      } else {
        plugins.push(
          // Render styles into separate cacheable file to prevent FOUC and
          // optimize for critical rendering path.
          new ExtractTextPlugin('app-[hash].css', {
            allChunks: true,
          }),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.OccurrenceOrderPlugin(),
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              screw_ie8: true, // eslint-disable-line camelcase
              warnings: false, // Because uglify reports irrelevant warnings.
            },
            comments: /SCREW_COMMENTS/, // Don't want to preserve any comments.
          }),
          new webpack.SourceMapDevToolPlugin({
            filename: '[file].map',
          }),
          webpackIsomorphicToolsPlugin,
          new CopyWebpackPlugin([{
            from: './src/common/app/favicons/',
            to: 'favicons',
          }], {
            ignore: ['original/**'],
          }),
        );
      }
      return plugins;
    })(),
    toolbox: {
      theme: path.join(__dirname, '../src/browser/app/toolbox-theme.scss'),
    },
    postcss: () => [autoprefixer({ browsers: 'last 2 version' })],
    resolve: {
      extensions: ['', '.js', '.scss'], // .json is ommited to ignore ./firebase.json
      modulesDirectories: ['src', 'node_modules'],
      root: constants.ABSOLUTE_BASE,
      alias: {
        react$: require.resolve(path.join(constants.NODE_MODULES_DIR, 'react')),
      },
    },
  };

  return config;
};

export default makeConfig;
