'use strict';
const config = require('./config');
const PORT = config.get('PORT');
// const CLOUD_BUCKET = config.get('CLOUD_BUCKET');
// const storage = require('@google-cloud/storage')();
// const bucket = storage.bucket(CLOUD_BUCKET);
const path = require('path');
const express = require('express');
const app = express();

//Folder settings
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/art",express.static(path.join(__dirname, '../art')));
app.use("/bin",express.static(path.join(__dirname, '../bin')));

// function getPublicUrl(filename) {
//   return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
// }

// function svgToTTF(filename, string) {
//   if (path.extname(filename) !== '.svg') {
//     console.log(`Exiting: not .svg file`);
//     return;
//   }
//   string = string.replace(/\d{4}[-]\d{2}[-]\d{2}[_]\d{2}[_]\d{2}[_]\d{2}[_]\d{3}[_]/g, '');
//   var svg2ttf = require('svg2ttf');
//   var ttf = svg2ttf(string, {});
//   var file = bucket.file(path.basename(filename, '.svg') + '.ttf');
//   file.save(ttf.buffer);
// };

// //Post upload-file-to-cloud
// app.post('/upload-file-to-cloud', function(req, res) {
//   if (req.method == 'POST') {
//     var string = '';
//     req.on('data', function(data) {
//       string += data;
//     });
//     req.on('end', function() {
//       //Upload to Google Cloud file storage
//       var dat = string.split("<desc>");
//       dat = dat[1].split("</desc>")[0];
//       var json = JSON.parse(dat);
//       var filename = json["name"]+".svg";
//       const file = bucket.file(filename);
//       file.save(string).then(function() { svgToTTF(filename, string); });
//     });
//   }
// });

app.get('/', (req, res) => {
  res.send('Use the basename of the app file in the address, such as "localhost:8080/Checkers"');
});

app.get('/:appFileBasename', (req, res) => {
  res.render('framework.pug', { appFileBasename : req.params.appFileBasename });
});

//Basic 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

//Basic error handler
app.use((err, req, res) => {
  /* jshint unused:false */
  console.error(err);
  //If our routes specified a specific response, then send that. Otherwise,
  //send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  //Start server
  const server = app.listen(process.env.PORT || PORT, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
