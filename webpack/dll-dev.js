let fs = require("fs");
let path = require("path");
let webpack = require("webpack");

let { matchCssRule, matchFontsRule } = require("./shared");

module.exports = {
  mode: "development",
  entry: ["react", "lodash"],
  output: {
    filename: "dll_vendors_[hash:8].js",
    path: path.join(__dirname, "dll"),
    library: "dll_vendors_[hash:8]",
  },
  devtool: "cheap-source-map",
  module: {
    rules: [matchCssRule, matchFontsRule],
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
    new webpack.NamedModulesPlugin(),
    new webpack.DllPlugin({
      name: "dll_vendors_[hash:8]",
      path: path.join(__dirname, "dll/manifest.json"),
    }),
  ],
};
