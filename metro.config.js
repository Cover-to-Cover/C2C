// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const nodeLibs = require('node-libs-react-native');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...nodeLibs,
  stream: require.resolve('stream-browserify'),
  net:    require.resolve('empty-module'),
  tls:    require.resolve('empty-module'),  // add this line
  // add more stubs here as you hit other “native Node” module errors
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

module.exports = config;
