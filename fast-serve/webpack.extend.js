const path = require("path");

const webpackConfig = {
  devtool: "source-map" // <-- aktiviert Source Maps sichtbar im DevTools
};

const transformConfig = function (config) {
  config.watchOptions = {
    ignored: /node_modules/,
    poll: 1000 // <-- stabilisiert den Watcher
  };

  return config;
};

module.exports = {
  webpackConfig,
  transformConfig
};
