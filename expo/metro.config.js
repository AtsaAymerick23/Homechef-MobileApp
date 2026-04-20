const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

module.exports = withRorkMetro(config);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-web-webview': require.resolve('./react-native-web-webview.js'),
};

module.exports = config;