////////////////////////////////////////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////////////////////////////////////////
if (typeof DEBUG!=='undefined' && DEBUG==1) {function debug(s){console.log(s);}} else {function debug(s){}}
////////////////////////////////////////////////////////////////////////////////
myUser = { username:'test', id:'777', email:'test@test.test', imageURL:'https://test/test.jpg' }
myUser.longId = `g${myUser.id}_${myUser.username}`;
myUser.lang = 'teonaht';
////////////////////////////////////////////////////////////////////////////////
const statusEl = document.getElementById('status');
const spinnerEl = document.getElementById('spinner');
const canvasEl = document.getElementById('canvas');
const uiDivEl = document.getElementById('ui-div');
const outputEl = document.getElementById('output');
const messageFormEl = document.getElementById('message-form');
const messageInputEl = document.getElementById('message-input');
const messagesEl = document.getElementById('messages');
var clickEv = 'click'; //Assume mouse until proven touchable
var outputShowing = false;
////////////////////////////////////////////////////////////////////////////////
// Rotation as needed to always show in landscape
////////////////////////////////////////////////////////////////////////////////
function transformElement(el, xform) {
  el.style.webkitTransform = xform;
  el.style.mozTransform = xform;
  el.style.msTransform = xform;
  el.style.oTransform = xform;
  el.style.transform = xform;
}
function setCanvasSizeRotateOn(w, h) {
  wOld = canvasEl.style.width;
  hOld = canvasEl.style.height;
  canvasEl.style.width = w;
  canvasEl.style.height = h;
  xOffset = (parseInt(hOld) - h) >> 1;
  yOffset = (w - parseInt(wOld)) >> 1;
  transformElement(canvasEl, 'rotate(90deg) translate(' + xOffset + 'px,' + yOffset + 'px)');
}
function setRotateOff() {
  transformElement(canvasEl, 'none');
}
////////////////////////////////////////////////////////////////////////////////
// Speech synth
////////////////////////////////////////////////////////////////////////////////
function say(text, pitch=2.5) {
  var utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = pitch;
  utterance.lang = "en-US";
  utterance.volume = 0.15;
  window.speechSynthesis.speak(utterance);
}
////////////////////////////////////////////////////////////////////////////////
// Show and hide elements for writing and displaying messages
////////////////////////////////////////////////////////////////////////////////
function showOutput() {
  if (outputShowing) {
    debug('Output already showing');
  }
  else {
    debug('showOutput');
    outputShowing=true;
    //Output
    canvasEl.addEventListener(clickEv, hideOutput, 'once');
    //Messages
    uiDivEl.style.display='block';
    messagesEl.style.display='block'; //Always show messages
    messagesEl.style.top='30px'; //Move below input field
    //Messages input
    messageFormEl.style.display='block'; //Show input field and button
    messageInputEl.addEventListener('keydown', inputSpecial); //Required for special keys in input field
    messageInputEl.addEventListener('keyup', inputSpecial); //Required for special keys in input field
    messageInputEl.addEventListener('mousedown', inputSpecial); //Required for special keys in input field
    messageInputEl.addEventListener('mouseup', inputSpecial); //Required for special keys in input field
    messageInputEl.focus();
  }
}
function hideOutput() {
  debug('hideOutput');
  outputShowing=false;
  //Output
  outputEl.innerHTML='';
  canvasEl.removeEventListener(clickEv, hideOutput, 'once');
  //Messages
  uiDivEl.style.display='none';
  messages.style.top='0';
  //Messages input
  messageInputEl.value='';
  messageInputEl.removeEventListener('keydown', inputSpecial);
  messageInputEl.removeEventListener('keyup', inputSpecial);
  messageInputEl.removeEventListener('mousedown', inputSpecial);
  messageInputEl.removeEventListener('mouseup', inputSpecial);
  //Speech
  window.speechSynthesis.cancel();
}
////////////////////////////////////////////////////////////////////////////////
// Mouse or touchpad mode
////////////////////////////////////////////////////////////////////////////////
function setMouseOrTouchMode() {
  debug('Input device: '+clickEv);
  XMPlayer.play(); //Music can only begin on user input
  //window.dispatchEvent(new Event('resize')); //Trigger resize event
  canvasEl.removeEventListener('click', setMouseOrTouchMode);
  canvasEl.removeEventListener('touchstart', setTouchMode);
}
function setTouchMode() {
  clickEv = 'touchstart';
  setMouseOrTouchMode();
}
canvasEl.addEventListener('click', setMouseOrTouchMode);
canvasEl.addEventListener('touchstart', setTouchMode);
////////////////////////////////////////////////////////////////////////////////
// Load music
////////////////////////////////////////////////////////////////////////////////
(function (window, document) {
  if (!window.XMPlayer) {
    window.XMPlayer = {};
  }
  window.onload = function() {
    XMPlayer.init();
    var xmReq = new XMLHttpRequest();
    xmReq.open("GET", 'art/aud/you-are-maybe.xm', true);
    xmReq.responseType = "arraybuffer";
    xmReq.onload = function(xmEvent) {
      var arrayBuffer = xmReq.response;
      if (arrayBuffer) {
        XMPlayer.load(arrayBuffer);
        XMPlayer.play();
      } else {
        debug("unable to load .xm uri");
      }
    };
    xmReq.send(null);
  };
})(window, document);
////////////////////////////////////////////////////////////////////////////////
// Module
////////////////////////////////////////////////////////////////////////////////
var Module = {
  print: (function() {
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      if (text === '[[setHideOutput]]') {
        hideOutput();
      } else if (text === '[[setRotateOff]]') {
        setRotateOff();
      } else if (text.substr(0,24) === '[[setCanvasSizeRotateOn,') {
        var s = text.split(',');
        setCanvasSizeRotateOn(s[1],s[2].substr(s[2], s[2].length-2));
      } else if (text === '[[setPauseAudioOn]]') {
        XMPlayer.pause();
      } else if (text === '[[setPauseAudioOff]]') {
        window.speechSynthesis.cancel();
        XMPlayer.play();
      } else if (text.substr(0,11) === '[[setAudio,') {
        var s = text.split(',');
        XMPlayer.stop();
        var xmReq = new XMLHttpRequest();
        xmReq.open("GET", "art/aud/" + s[1].substr(s[1], s[1].length-2), true);
        xmReq.responseType = "arraybuffer";
        xmReq.onload = function(xmEvent) {
          var arrayBuffer = xmReq.response;
          if (arrayBuffer) {
            XMPlayer.load(arrayBuffer);
            XMPlayer.play();
          } else {
            debug("unable to load .xm uri");
          }
        };
        xmReq.send(null);
      } else if (text.substr(0,16) === '[[setFormInput]]') {
        inputText(text.substr(16,text.length-16));
      } else if (text.substr(0,9) === '[[debug]]') {
        debug(text);
      } else {
        if (text.substr(0,10) === '[[setSay]]') {
          text=text.substr(10);
          say(text.replace(/\<br\>/g,','));
        }
        text=text.replace(/&/g, "&amp;");
        outputEl.innerHTML+=text;
        showOutput();
        debug(text);
      }
    };
  })(),
////////////////////////////////////////////////////////////////////////////////
// Standard
////////////////////////////////////////////////////////////////////////////////  
  preRun: [],
  postRun: [],
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (typeof dump == 'function') {
      dump(text+'\n'); //Directly to real console
    } else {
      console.error(text);
    }
  },
  canvas: (function() {
    return document.getElementById('canvas');
  })(),
  setStatus: function(text) {
    if (text==='Running...') {
      debug('Running...');
      spinnerEl.remove(); //Would be hidden anyway, but remove it
    }
    statusEl.innerHTML=text;
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    var s = left ? 'Preparing...' : 'Downloads complete...';
    Module.setStatus(s);
    debug(s);
  }
};
Module.setStatus('Downloading...');
window.onerror = function(event) {
  Module.setStatus('Exception thrown, see JavaScript console');
  spinnerEl.remove(); //Would be hidden anyway, but remove it
  Module.setStatus = function(text) {
    if (text) Module.printErr('[post-exception status] ' + text);
  };
};
