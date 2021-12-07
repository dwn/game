////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////
'use strict';
const fs = require('fs');
const path = require('path');
const cfg = JSON.parse(fs.readFileSync('art/cfg.json', 'utf8'));
const PORT = cfg['PORT'];
const CLOUD_BUCKET = cfg['CLOUD_BUCKET'];
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket(CLOUD_BUCKET);
//
// const firebase = require("firebase");
// require("firebase/firestore");
// firebase.initializeApp({
//   apiKey: '### FIREBASE API KEY ###',
//   authDomain: '### FIREBASE AUTH DOMAIN ###',
//   projectId: cfg['PROJECT_ID']
// });
// var db = firebase.firestore();
//
const express = require('express');
const app = express();
const server = require('http').Server(app);
const request = require('request');
const io = require('socket.io')(server);
////////////////////////////////////////////
// Setup
////////////////////////////////////////////
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
////////////////////////////////////////////
var arrLang;
request.get('https://dwn.github.io/common/lang/list', function (error, response, body) {
  if (!error && response.statusCode === 200) {
    arrLang = body.split('\n').filter(function (el) { return el !== null && el !== ''; });
  }
});
////////////////////////////////////////////
// Chat
////////////////////////////////////////////
var dicFontBasename = {};
////////////////////////////////////////////
var connections = new Set();
io.on('connection', (socket) => {
  connections.add(socket);
  for(var user in dicFontBasename) {
    socket.emit('chat font', user+':'+dicFontBasename[user]);
  }
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    console.log('MSG.'+msg);
  });
  socket.on('chat font', (msg) => {
    io.emit('chat font', msg);
    console.log('FONT.'+msg);
  });
  socket.once('disconnect', function () {
    connections.delete(socket);
    console.log('DESOCKET.'+socket.id);
  });
});
////////////////////////////////////////////
app.get('/lang-file-url/:langFilename', (req, res) => { //Can be basename or full name of file
  let langFilename = req.params.langFilename;
  if (langFilename.match(/\d{4}[-]\d{2}[-]\d{2}[_]\d{2}[_]\d{2}[_]\d{2}[_]\d{3}[_]/)) {
    res.send(`https://storage.googleapis.com/${CLOUD_BUCKET}/${langFilename}`);
  } else {
    res.send(`https://dwn.github.io/common/lang/${langFilename}`);
  }
});
////////////////////////////////////////////
app.get('/writing-mode/:langFilename', (req, res) => { //Can be basename or full name of file
  request.get(`/lang-file-url/${req.params.langFilename}`, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let langFileURL;
      langFileURL = body;
      if (!langFileURL.includes('.svg')) langFileURL+='.svg';
      let json;
      request.get(langFileURL, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          json = JSON.parse(body.split(/<desc>|\/desc>/g)[1]);
          let d = json['direction'];
          res.send(d==='right-down'? 'horizontal-tb' :
                   d==='down-right'? 'vertical-lr': 'vertical-rl');
        }
      });
    }
  });
});
////////////////////////////////////////////
app.get('/chat/longId/:longId/lang/:lang', (req, res) => {
  let longId = req.params.longId;
  let lang = req.params.lang;
  io.emit('chat message', '_connected:'+longId+':'+lang);
  dicFontBasename[longId] = lang;
  res.sendStatus(200);
});
////////////////////////////////////////////
// Main
////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Use the basename of the app file in the address, such as "localhost:8080/Checkers"');
});
////////////////////////////////////////////
app.get('/:appFileBasename', (req, res) => {
  res.render('framework.pug', { appFileBasename : req.params.appFileBasename });
});
////////////////////////////////////////////
// Server
////////////////////////////////////////////
app.use((req, res) => { //Basic 404 handler
  res.status(404).send('Not Found');
});
////////////////////////////////////////////
app.use((err, req, res) => { //Basic error handler
  console.error(err);
  res.status(500).send(err.response || 'Something broke!');
});
////////////////////////////////////////////
if (module === require.main) {
  server.listen(process.env.PORT || PORT, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}
module.exports = app;
