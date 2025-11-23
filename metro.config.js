const path = require("node:path");
const fs = require("node:fs");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const {
  getDefaultConfig: getDefaultRnxKitConfig,
} = require("@rnx-kit/metro-config/src/defaultConfig");

const symlinkedNodeModules = path.resolve(__dirname, "node_modules");
const realNodeModules = fs.realpathSync(symlinkedNodeModules);

const [
  {
    resolver: { resolveRequest, platforms },
    serializer: { getModulesRunBeforeMainModule },
  },
] = getDefaultRnxKitConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
let config = {
  // While the original react-native-fiddle-repro template brings its own
  // node_modules, derived Fiddles do not, and so we symlink back to the
  // template's node_modules. Thus, below we adjust the Metro config to support
  // a sibling symlinked node_modules directory.
  //
  // It would be nice if it were that simple. Unfortunately, asset resolution is
  // a special case. Because it's based on URLs rather than paths, if your path
  // has any spaces in it (e.g. "./path/to/Application Support"), it fails the
  // pathBelongsToRoots() check in metro@0.82.5 (used by react-native@0.79.6 and
  // react-native-macos@0.79.0). I'm changing the template to use metro@0.83.3
  // which happens to fix this issue, though it's not the only issue with
  // assets, as you'll see with our rewriteRequestUrl() bit below.
  //
  // https://github.com/facebook/metro/issues/1609#issuecomment-3521286611

  resolver: {
    // This didn't help at all!
    // unstable_enableSymlinks: true,

    nodeModulesPaths: [realNodeModules],
    platforms,
    resolveRequest,
  },
  serializer: { getModulesRunBeforeMainModule },
  watchFolders: [realNodeModules],
  server: {
    // Rewrite all asset requests to resolve from the symlinked node_modules.
    // This is a workaround because asset lookup inside symlinked node_modules
    // fails when it involves a ../.. climb, which seems to cause us to lose the
    // magic "/assets" part.
    rewriteRequestUrl: (url) => {
      if (url.startsWith("/assets/..")) {
        const realSegment = encodeURI(
          path
            .relative(symlinkedNodeModules, realNodeModules)
            .replace(/^\.\./, "/assets")
        );
        const correctedPath = url.replace(realSegment, "/assets/node_modules");

        return correctedPath;
      }

      return url;
    },
  },
};

config = mergeConfig(getDefaultConfig(__dirname), config);

// I'm overwriting these paths for consistency, though haven't checked how
// necessary each of them are.
config.resolver.emptyModulePath = config.resolver.emptyModulePath.replace(
  symlinkedNodeModules,
  realNodeModules
);
config.transformer.asyncRequireModulePath =
  config.transformer.asyncRequireModulePath.replace(
    symlinkedNodeModules,
    realNodeModules
  );
config.transformer.babelTransformerPath =
  config.transformer.babelTransformerPath.replace(
    symlinkedNodeModules,
    realNodeModules
  );

module.exports = config;
