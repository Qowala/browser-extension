const path = require('path')
const nodeExternals = require('webpack-node-externals')
const config = require('./webpack.config')

config.entry = {
  'tests': './test/index.js'
}
config.output = {
  path: path.resolve(__dirname, './build/tests'),
  publicPath: '/build/tests',
  filename: '[name].js'
}
config.target = 'node'
config.externals = [ nodeExternals() ]
config.plugins = []

module.exports = config
