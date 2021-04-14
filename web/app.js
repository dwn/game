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
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const ulid = require('ulid');
////////////////////////////////////////////
// Setup
////////////////////////////////////////////
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
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
  // socket.on('chat font', (msg) => {
  //   io.emit('chat font', msg);
  //   console.log('FONT.'+msg);
  // });
  socket.once('disconnect', function () {
    connections.delete(socket);
    console.log('DESOCKET.'+socket.id);
  });
});
////////////////////////////////////////////
const arrUser = [
'adair','aiden','addison','adrian','leslie','ainsley','alby','alex',
'andy','sam','ash','elm','juniper','aspen','bailey','billie',
'dana','kelly','cody','jamie','morgan','nikki','skylar','shiloh',
'terry','kerry','story','sutton','leigh','lake','amari','charlie',
'bellamy','charlie','dakota','denver','emerson','finley','justice','river',
'skyler','tatum','avery','briar','brooklyn','campbell','dallas','gray',
'sage','haven','indigo','jordan','lennox','morgan','onyx','peyton',
'quinn','reese','riley','robin','rory','sawyer','shae','shiloh'];
function romanNumeral(number){
  var a, roman = ''; const romanNumList = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XV:40,X:10,IX:9,V:5,IV:4,I:1};
  if (number<1 || number>3999) return 'Enter a number between 1 and 3999';
  else for(let key in romanNumList) { a = Math.floor(number / romanNumList[key]); if(a >= 0) for(let i = 0; i < a; i++) roman += key; number = number % romanNumList[key]; }
  return roman;
}
function uniqueUsername(name=null) {
  var un = (name? name : arrUser[Math.floor(Math.random()*arrUser.length)]);
  var n = 1;
  if (dicFontBasename) {
    for(var user in dicFontBasename) {
      var un2=user.split('_')[1].split('-')[0];
      if (un===un2) n++;
    }
  }
  un += (n>1? '-' + romanNumeral(n) : '');
  return 'x' + ulid.ulid() + '_' + un; //Starts with a letter because sometimes uid gets interpretted as a number otherwise
}
var myUniqueUsername;
app.get('/unique-username', function(req, res) {
  res.send(uniqueUsername(req.query.name));
});
app.get('/my-unique-username', function(req, res) {
  myUniqueUsername = (myUniqueUsername? myUniqueUsername : uniqueUsername(req.query.name));
  res.send(myUniqueUsername);
});
////////////////////////////////////////////
function connectChat(username,fontBasename,isMe=false) {
  if (!username) username = myUniqueUsername = uniqueUsername();
  if (!fontBasename) fontBasename = 'NEW';
  io.emit('chat message', '_connected:'+username+':'+fontBasename);
  dicFontBasename[username] = fontBasename;
}
app.get('/chat/:fontBasename', (req, res) => {
  connectChat(req.query.username,req.params.fontBasename,true);
  res.render('chat.pug');
});
////////////////////////////////////////////
app.get('/bucket-url', (req, res) => {
  res.send(`https://storage.googleapis.com/${CLOUD_BUCKET}/`);
});
app.get('/common-url', (req, res) => {
  res.send(`https://dwn.github.io/common/`);
});
////////////////////////////////////////////
// Main
////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Use the basename of the app file in the address, such as "localhost:8080/Checkers"');
});
////////////////////////////////////////////
app.get('/:appFileBasename', (req, res) => {
  connectChat(null,req.query.font,true);
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
