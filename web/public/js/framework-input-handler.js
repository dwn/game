////////////////////////////////////////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////////////////////////////////////////
if (typeof DEBUG!=='undefined' && DEBUG==1) {function debug(s){console.log(s);}} else {function debug(s){}}
////////////////////////////////////////////////////////////////////////////////
// Special keyboard handling unfortunately needed because Emscripten eats all keyboard input
////////////////////////////////////////////////////////////////////////////////
var codeMap={'Shift':false};
var cur;
var curOld=cur;
var curSave=cur;
var val='';
var valOld=val;
var valSave=val;
function inputText(txt) {
  var val=messageInputEl.value;
  valOld=val;
  var a=val.substr(0,messageInputEl.selectionStart);
  var b=val.substr(messageInputEl.selectionEnd,val.length-messageInputEl.selectionEnd);
  if (codeMap['Shift']) txt=txt.replace(/1/g,'!')
                               .replace(/2/g,'@')
                               .replace(/3/g,'#')
                               .replace(/4/g,'$')
                               .replace(/5/g,'%')
                               .replace(/6/g,'^')
                               .replace(/7/g,'&')
                               .replace(/8/g,'*')
                               .replace(/9/g,'(')
                               .replace(/0/g,')');
  messageInputEl.value=a+txt+b;
  messageInputEl.selectionStart=messageInputEl.selectionEnd=cur=a.length+txt.length;
  val=messageInputEl.value;
  if (valOld!=val) valSave=valOld;
}
function inputSpecial(ev) {
  if (ev.keyCode==90&&ev.ctrlKey&&ev.type==='keydown') { //Undo last input on Ctrl-Z
    var tmp;
    tmp=val; val=valSave; valSave=tmp;
    messageInputEl.value=val;
    tmp=cur; cur=curSave; curSave=cur;
    messageInputEl.selectionStart=messageInputEl.selectionEnd=cur;
    return;
  }
  if (ev.type==='mousedown') {
    curOld=messageInputEl.selectionEnd;
    debug('dn curOld='+curOld);
    return;
  }
  if (ev.type==='mouseup') { //Cursor leaves where it did not enter
    cur=(curOld==messageInputEl.selectionStart?
      messageInputEl.selectionEnd :
      messageInputEl.selectionStart);
      debug('up curOld='+curOld+' cur='+cur);
    return;
  }
  codeMap[ev.code]=(ev.type==='keydown');
  if (codeMap['Enter']) {
    codeMap['Enter']=false; //Have to set this to false now since the listener will be gone
    document.getElementById('message-button').click();
  }
  val=messageInputEl.value;
  codeMap['Shift']=ev.shiftKey;
  if (codeMap['Backspace'] || codeMap['Delete']) {
    valOld=val;
    var a=val.substr(0,messageInputEl.selectionStart);
    var b=val.substr(messageInputEl.selectionEnd,val.length-messageInputEl.selectionEnd);
    messageInputEl.value=val=a+b;
    messageInputEl.selectionStart=messageInputEl.selectionEnd=cur=a.length;
    if (valOld==val) {
      if (codeMap['Backspace']) {
        b=val.substr(cur,val.length);
        if (cur>0) cur--;
        a=val.substr(0,cur);
      }
      if (codeMap['Delete']) {
        a=val.substr(0,cur);
        if (cur<val.length) cur++;
        b=val.substr(cur,val.length);
        cur--;
      }
    }
    messageInputEl.value=a+b;
    messageInputEl.selectionStart=messageInputEl.selectionEnd=cur;
    val=messageInputEl.value;
    if (valOld!=val) valSave=valOld;
  }
  else if (codeMap['ArrowLeft']) {
    if (codeMap['Shift']) {
      const left=(messageInputEl.selectionStart==cur);
      if (cur>0) cur--;
      if (left) messageInputEl.selectionStart=cur;
      else messageInputEl.selectionEnd=cur;
    }
    else {
      cur=messageInputEl.selectionStart;
      if (cur>0) cur--;
      messageInputEl.selectionStart=messageInputEl.selectionEnd=cur;
    }
  }
  else if (codeMap['ArrowRight']) {
    if (codeMap['Shift']) {
      const right=(messageInputEl.selectionEnd==cur);
      if (cur<val.length) cur++;
      if (right) messageInputEl.selectionEnd=cur;
      else messageInputEl.selectionStart=cur;
    }
    else {
      cur=messageInputEl.selectionEnd;
      if (cur<val.length) cur++;
      messageInputEl.selectionStart=messageInputEl.selectionEnd=cur;
    }
  }
}
