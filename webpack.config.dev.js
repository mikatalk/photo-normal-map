module.exports = require('./webpack.config')({
  isProduction: false,
  devtool: 'cheap-eval-source-map',
  port: 50000
});
