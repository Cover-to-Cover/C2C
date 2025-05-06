module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],       // or your existing preset
      plugins: [
        [
          'module:react-native-dotenv',
          {
            moduleName: '@env',
            path: '.env',
            safe: false,       // set to true if you want to require every var in a .env.example
            allowUndefined: true,
          },
        ],
      ],
    };
  };  