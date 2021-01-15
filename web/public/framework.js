////////////////////////////////////////////////////////////////////////////////
//Dan Nielsen
////////////////////////////////////////////////////////////////////////////////
var statusEl = document.getElementById('status');
var spinnerEl = document.getElementById('spinner');
var canvasEl = document.getElementById('canvas');
var outputEl = document.getElementById('output');
var outputDivEl = document.getElementById('output-div');
var clickEv = 'click'; //Mouse until proven innocent

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

function showOutput() {
  outputDivEl.removeAttribute('style');
  outputEl.removeAttribute('style');
  outputDivEl.addEventListener(clickEv, hideOutput, 'once');
}

function hideOutput() {
  window.speechSynthesis.cancel();
  outputDivEl.setAttribute('style', 'display:none');
  outputEl.innerText='';
}

function showUI() {
  XMPlayer.play();
  //window.dispatchEvent(new Event('resize')); //Trigger resize event
  // document.getElementById('rgt-icn').removeAttribute('style');
  canvasEl.removeEventListener('click', showUI);
  canvasEl.removeEventListener('touchstart', setTouch);
}

function setTouch() {
  clickEv = 'touchstart';
  showUI();
}

canvasEl.addEventListener('click', showUI);
canvasEl.addEventListener('touchstart', setTouch);

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
      } else {
        console.log("unable to load .xm uri");
      }
    };
    xmReq.send(null);
  };
})(window, document);

var Module = {
  preRun: [],
  postRun: [],
  print: (function() {
    return function(text) {
      if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
      if (text.substr(text.length-17, text.length) === '[[setHideOutput]]') {
        hideOutput();
      } else if (text === '[[setRotateOff]]') {
        setRotateOff();
      } else if (text.substr(0,24) === '[[setCanvasSizeRotateOn,') {
        var s = text.split(',');
        setCanvasSizeRotateOn(s[1],s[2].substr(s[2], s[2].length-2));
      } else if (text === '[[setPauseAudioOn]]') {
        XMPlayer.pause();
      } else if (text === '[[setPauseAudioOff]]') {
        XMPlayer.play();
      } else if (text === '[[setAccountPageOpen]]') {
        window.speechSynthesis.cancel();
        window.open('upload_avatar');
        text=''; //Clear text
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
            console.log("unable to load .xm uri");
          }
        };
        xmReq.send(null);
      } else {  
        // These replacements are necessary if you render to raw HTML
        //text = text.replace(/&/g, "&amp;");
        //text = text.replace(/</g, "&lt;");
        //text = text.replace(/>/g, "&gt;");
        //text = text.replace('\n', '<br>', 'g');
        console.log(text);
        if (outputEl) {
          outputEl.innerText += text + "\n";
          outputEl.scrollTop = outputEl.scrollHeight; // focus on bottom
          var utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "en-US";
          utterance.volume = 0.15;
          window.speechSynthesis.speak(utterance);
        }
        showOutput();
      }
    };
  })(),
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if (0) { // XXX disabled for safety typeof dump == 'function') {
      dump(text + '\n'); // fast, straight to the real console
    } else {
      console.error(text);
    }
  },
  canvas: (function() {
    return document.getElementById('canvas');
  })(),
  setStatus: function(text) {
    if (text==='Running...') {
      console.log('Running...');
      // spinnerEl.remove();
    }
    statusEl.innerHTML = text;
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    var s = left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete';
    Module.setStatus(s);
    console.log(s);
  }
};
Module.setStatus('Downloading...');
window.onerror = function(event) {
  // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
  Module.setStatus('Exception thrown, see JavaScript console');
  // spinnerEl.remove();
  Module.setStatus = function(text) {
    if (text) Module.printErr('[post-exception status] ' + text);
  };
};
