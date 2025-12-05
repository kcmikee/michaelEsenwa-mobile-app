// Learn more https://docs.expo.io/guides/customizing-metro
// const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const { getDefaultConfig } = require("expo/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

module.exports = (() => {
  /** @type {import('expo/metro-config').MetroConfig} */
  const config = getDefaultConfig(__dirname);
  const configWithReanimated = wrapWithReanimatedMetroConfig(config);

  const { transformer, resolver } = configWithReanimated;

  configWithReanimated.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  };

  // Ensure resolver exists and has the required properties
  const safeResolver = resolver || {};
  const defaultAssetExts = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "bmp",
    "svg",
    "ttf",
    "otf",
    "woff",
    "woff2",
    "eot",
  ];
  const defaultSourceExts = ["js", "jsx", "json", "ts", "tsx"];

  configWithReanimated.resolver = {
    ...safeResolver,
    assetExts: (safeResolver.assetExts || defaultAssetExts)
      .filter((ext) => ext !== "svg")
      .concat(["lottie"]),
    sourceExts: [...(safeResolver.sourceExts || defaultSourceExts), "svg"],
    unstable_conditionNames: ["browser", "require", "react-native"],
  };

  return configWithReanimated;
})();
