module.exports = function (api) {
  api.cache(true);
  const plugins = ['react-native-reanimated/plugin',


    // [
    //   "module-resolver",
    //   {
    //     extensions: [
    //       ".js",
    //       ".jsx",
    //       ".ts",
    //       ".tsx",
    //       ".android.js",
    //       ".android.tsx",
    //       ".ios.js",
    //       ".ios.tsx",
    //     ],
    //     alias: {
    //       "src/*": "./src/*",
    //       "@config": "./src/constants/env.js",
    //     },
    //     root: ["./"],
    //   },
    // ],
  ];

  return {
    presets: [
      ['babel-preset-expo'],
    ],
    plugins
  };
};
