const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Mêmes tokens que l'app : `src/global.css` importe celui du mobile.
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
});
