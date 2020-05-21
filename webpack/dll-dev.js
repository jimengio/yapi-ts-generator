let fs = require("fs");
let path = require("path");
let webpack = require("webpack");

let { matchCssRule, matchFontsRule } = require("./shared");

module.exports = {
  mode: "development",
  entry: [
    "react",
    "react-dom",
    "emotion",
    "immer",
    "axios",
    "dayjs",
    "lodash",
    "highlight.js/lib/highlight.js",
    "highlight.js/lib/languages/javascript.js",
    "highlight.js/lib/languages/typescript.js",
    "highlight.js/lib/languages/clojure.js",
    "highlight.js/lib/languages/coffeescript.js",
    "highlight.js/lib/languages/css.js",
    "highlight.js/lib/languages/xml.js",
    "highlight.js/lib/languages/bash.js",
    "remarkable",
    "autolinker",
    "react-transition-group",
    "cson-parser/lib/stringify",
  ],
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
