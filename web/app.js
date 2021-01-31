////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////
'use strict';
const config = require('./config');
const PORT = config.get('PORT');
const CLOUD_BUCKET = config.get('CLOUD_BUCKET');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const ULID = require('ulid');
////////////////////////////////////////////
// Setup
////////////////////////////////////////////
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/art",express.static(path.join(__dirname, '../art')));
app.use("/bin",express.static(path.join(__dirname, '../bin')));
////////////////////////////////////////////
// Chat
////////////////////////////////////////////
var dicFontFilename = {};
////////////////////////////////////////////
var connections = new Set();
io.on('connection', (socket) => {
  connections.add(socket);
  for(var user in dicFontFilename) {
    socket.emit('chat font', user+':'+dicFontFilename[user]);
  }
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    console.log('MSG'+msg);
  });
  socket.on('chat font', (msg) => {
    io.emit('chat font', msg);
    console.log('FONT'+msg);
  });
  socket.once('disconnect', function () {
    connections.delete(socket);
    console.log('DESOCKET_'+socket.id);
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
app.get('/unique-username', function(req, res) {
  var n = 1;
  var un = (req.query.name? req.query.name : arrUser[Math.floor(Math.random()*arrUser.length)]);
  for(var user in dicFontFilename) {
    var un2=user.split('_')[2].split('-')[0];
    if (un===un2) n++;
  }
  un += (n>1?  '-' + romanNumeral(n) : '');
  res.send('_'+ ULID.ulid() +'_' + un);
});
////////////////////////////////////////////
function chat(username,fontFilename) {
  io.emit('chat message', '__connected:'+username+':'+fontFilename);
  dicFontFilename[username] = fontFilename;
}
////////////////////////////////////////////
// Main
////////////////////////////////////////////
app.get('/bucket-uri', (req, res) => {
  res.send(`https://storage.googleapis.com/${CLOUD_BUCKET}/`);
});
////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Use the basename of the app file in the address, such as "localhost:8080/Checkers"');
});
////////////////////////////////////////////
app.get('/:appFileBasename', (req, res) => {
  chat(req.query.username,req.query.fontFilename);
  res.render('framework.pug', { appFileBasename : req.params.appFileBasename });
});
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
// Standard
////////////////////////////////////////////
if (module === require.main) {
  //Start server
  server.listen(process.env.PORT || PORT, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}
module.exports = app;
