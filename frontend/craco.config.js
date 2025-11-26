const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable strict minification errors
      const minimizer = webpackConfig.optimization.minimizer;
      if (minimizer) {
        minimizer.forEach((plugin) => {
          if (plugin.constructor.name === "CssMinimizerPlugin") {
            // Use CleanCSS to avoid build failure
            plugin.options.minify = CssMinimizerPlugin.cleanCssMinify;
          }
        });
      }
      return webpackConfig;
    },
  },
};
