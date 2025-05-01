// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const nodeLibs = require("node-libs-react-native");

// stub out server‐only cores
nodeLibs.net = require.resolve("empty-module");
nodeLibs.tls = require.resolve("empty-module");
// (you can also stub fs, path, etc., here if needed)

const config = getDefaultConfig(__dirname);
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...(config.resolver.extraNodeModules || {}),
    ...nodeLibs,
  },
};
module.exports = config;
