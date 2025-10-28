module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Keep react-native-reanimated plugin last per reanimated installation guide
      "react-native-reanimated/plugin",
    ],
  };
};
