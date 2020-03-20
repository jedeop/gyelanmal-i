const path = require('path');

module.exports = function(env) {
  return {
    mode: env && env.prod? 'production' : 'development',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'public'),
      filename: 'index.bundle.js'
    },
    watch: env && env.watch
  }
}