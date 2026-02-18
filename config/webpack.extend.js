const webpack = require('webpack');

module.exports = (config) => {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    util: require.resolve('util/'),
    stream: require.resolve('stream-browserify'),
    timers: require.resolve('timers-browserify'),
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser')
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: ['process']
    })
  ]);

  return config;
};
