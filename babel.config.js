module.exports = function (api) {
  api.cache(true);
  api.cache(true);
  return {
    presets: [["babel-preset-expo", {
      jsxImportSource: "nativewind"
    }], ['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript', "nativewind/babel"],
    plugins: [// Required for expo-router
    'expo-router/babel', ["module-resolver", {
      root: ["./"],

      alias: {
        "@": "./",
        "tailwind.config": "./tailwind.config.js"
      }
    }], "react-native-reanimated/plugin"],
  };
};
