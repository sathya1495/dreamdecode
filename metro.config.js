const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add .wasm to both assetExts AND sourceExts for expo-sqlite web compatibility
config.resolver.assetExts = [...(config.resolver.assetExts || []).filter((ext) => ext !== "wasm"), "wasm"];
config.resolver.sourceExts = [...(config.resolver.sourceExts || []).filter((ext) => ext !== "wasm")];

module.exports = withNativeWind(config, { input: "./global.css" });
