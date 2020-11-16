var path = require('path');

var TARGET_DIR = path.resolve(__dirname, 'target');
var SRC_DIR = path.resolve(__dirname, 'src');

var config = {
  entry: SRC_DIR + '/index.ts',
  output: {
    path: TARGET_DIR,
    filename: 'bundle.js'
  },
  target: "node",
  mode: "production",
  
  module: {
    rules: [
      {
        // Compile .ts and .tsx files
        test: /\.tsx?$/,
        use: [ 
          {
            loader: 'ts-loader'
          }
        ]
      },
      // Workaround for mjs files - they are still in infancy and brake the build occasionally 
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: []
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.ts' ]
  },
  externals: {
    // Instead of just bundling the file, this will replace require(../config/config.js) with require(./config/config.js)
    "../config/config": "commonjs ./config/config.js" 
  },
  devtool: "cheap-module-source-map"
};

module.exports = config;