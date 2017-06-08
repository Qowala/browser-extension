const nodeExternals = require('webpack-node-externals')
const config = require('./webpack.config')

config.entry = {
  'tests': './test/index.js'
}
config.target = 'node'
config.externals = [ nodeExternals() ]

module.exports = config
