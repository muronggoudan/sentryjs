const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: ['./index.js'],
	// entry: ['./src/main.js'],
  
  output: {
  	filename: 'sentry.v1.0.0.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  mode: 'development',
  
  devtool: 'source-map',
  
  devServer: {
  	contentBase: './dist'
  },
  
  module: {
  	rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  },
  
  plugins: [
  	new HtmlWebpackPlugin(),
  ]
};
  