////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////
'use strict';
const nconf = (module.exports = require('nconf'));
const path = require('path');
nconf.file({file: path.join(__dirname, '../art/cfg.json')});
// Check for required settings
checkConfig('CLOUD_BUCKET');
checkConfig('PORT');
function checkConfig(setting) {
  if (!nconf.get(setting)) {
    throw new Error(
      `You must set ${setting} in the config file!`
    );
  }
}
