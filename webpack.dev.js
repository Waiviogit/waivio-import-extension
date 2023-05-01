const path = require('path');
const config = require('./webpack.config');

module.exports = {
  ...config,
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'extension'),
    },
    port: 8020,
  },
  performance: { hints: false },
  output: { ...config.output, publicPath: '/' },
};
