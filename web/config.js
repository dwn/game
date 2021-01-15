'use strict';
// Hierarchical node.js config with commandline args, env vars, and files
const nconf = (module.exports = require('nconf'));
const path = require('path');
nconf
  // 1. Command-line arguments
  // .argv() // Uncomment to allow override by argument
  // 2. Environment variables
  // .env(['NODE_ENV']) // Uncomment and add variables to allow override by environment variable
  // 3. Config file
  .file({file: path.join(__dirname, '../art/cfg.json')}) // Uncomment to allow override by data file
  // 4. Defaults
  // .defaults({
  //   CLOUD_BUCKET: 'game-bucket',
  //   PORT: 8080,
  // })
  ;
// Check for required settings
checkConfig('CLOUD_BUCKET');
checkConfig('PORT');
function checkConfig(setting) {
  if (!nconf.get(setting)) {
    throw new Error(
      `You must set ${setting} as an environment variable or in config.json!`
    );
  }
}
