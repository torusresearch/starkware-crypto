const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')

const pkg = require('./package.json')

const pkgName = 'starkware-crypto'
const libraryName = pkgName.charAt(0).toUpperCase() + pkgName.slice(1)

const { NODE_ENV = 'production' } = process.env

const baseConfig = {
  mode: NODE_ENV,
  devtool: 'source-map',
  entry: './src/index.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: libraryName,
    libraryExport: 'default',
  },
  resolve: {
    alias: {
    //   'bn.js': path.resolve(__dirname, 'node_modules/bn.js'),
    },
  },
  module: {
    rules: [],
  },
  node: {
    vm: 'empty',
  },
}

const optimization = {
  optimization: {
    minimize: false,
  },
}

const babelLoader = {
  test: /\.m?js$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: 'babel-loader',
  },
}

const cjsConfig = {
  ...baseConfig,
  ...optimization,
  output: {
    ...baseConfig.output,
    filename: `${pkgName}.cjs.js`,
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [babelLoader],
  },
  plugins: [
    new ESLintPlugin({
      files: 'src',
    }),
  ],
  externals: [...Object.keys(pkg.dependencies), /^(@babel\/runtime)/i],
  node: {
    ...baseConfig.node,
  },
}

module.exports = [cjsConfig]