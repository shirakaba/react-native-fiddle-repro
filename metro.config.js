const path = require("node:path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // While the original react-native-fiddle-repro template brings its own
  // node_modules, derived Fiddles do not, and so we symlink back to the
  // template's node_modules. Thus, below we adjust the Metro config to support
  // a sibling symlinked node_modules directory.
  resolver: { unstable_enableSymlinks: true },
  watchFolders: [path.resolve(__dirname, "node_modules")],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
