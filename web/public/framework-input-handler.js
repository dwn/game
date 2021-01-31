////////////////////////////////////////////////////////////////////////////////
// Dan Nielsen
////////////////////////////////////////////////////////////////////////////////
if (typeof DEBUG!=='undefined' && DEBUG==1) {function debug(s){console.log(s);}} else {function debug(s){}}
////////////////////////////////////////////////////////////////////////////////
// Special keyboard handling unfortunately needed because Emscripten eats all keyboard input
////////////////////////////////////////////////////////////////////////////////
var codeMap={'Shift':false,'Control':false};
var cur=messagesInputEl.selectionEnd;
var curOld=cur;
var curSave=cur;
var val='';
var valOld=val;
var valSave=val;
function inputText(txt) {
  var val=messagesInputEl.value;
  valOld=val;
  var a=val.substr(0,messagesInputEl.selectionStart);
  var b=val.substr(messagesInputEl.selectionEnd,val.length-messagesInputEl.selectionEnd);
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
  messagesInputEl.value=a+txt+b;
  messagesInputEl.selectionStart=messagesInputEl.selectionEnd=cur=a.length+txt.length;
  val=messagesInputEl.value;
  if (valOld!=val) valSave=valOld;
}
function inputSpecial(ev) {
  if (ev.keyCode==90&&ev.ctrlKey&&ev.type==='keydown') { //Undo last input on Ctrl-Z
    var tmp;
    tmp=val; val=valSave; valSave=tmp;
    messagesInputEl.value=val;
    tmp=cur; cur=curSave; curSave=cur;
    messagesInputEl.selectionStart=messagesInputEl.selectionEnd=cur;
    return;
  }
  if (ev.type==='mousedown') {
    curOld=messagesInputEl.selectionEnd;
    debug('dn curOld='+curOld);
    return;
  }
  if (ev.type==='mouseup') { //Cursor leaves where it did not enter
    cur=(curOld==messagesInputEl.selectionStart?
      messagesInputEl.selectionEnd :
      messagesInputEl.selectionStart);
      debug('up curOld='+curOld+' cur='+cur);
    return;
  }
  codeMap[ev.code]=(ev.type==='keydown');
  if (codeMap['Enter']) {
    codeMap['Enter']=false; //Have to set this to false now since the listener will be gone
    document.getElementById('messages-button').click();
  }
  val=messagesInputEl.value;
  codeMap['Shift']=ev.shiftKey;
  codeMap['Control']=ev.ctrlKey;
  if (codeMap['Backspace'] || codeMap['Delete']) {
    valOld=val;
    var a=val.substr(0,messagesInputEl.selectionStart);
    var b=val.substr(messagesInputEl.selectionEnd,val.length-messagesInputEl.selectionEnd);
    messagesInputEl.value=val=a+b;
    messagesInputEl.selectionStart=messagesInputEl.selectionEnd=cur=a.length;
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
    messagesInputEl.value=a+b;
    messagesInputEl.selectionStart=messagesInputEl.selectionEnd=cur;
    val=messagesInputEl.value;
    if (valOld!=val) valSave=valOld;
  }
  else if (codeMap['ArrowLeft']) {
    if (codeMap['Shift']) {
      const left=(messagesInputEl.selectionStart==cur);
      if (cur>0) cur--;
      if (left) messagesInputEl.selectionStart=cur;
      else messagesInputEl.selectionEnd=cur;
    }
    else {
      cur=messagesInputEl.selectionStart;
      if (cur>0) cur--;
      messagesInputEl.selectionStart=messagesInputEl.selectionEnd=cur;
    }
  }
  else if (codeMap['ArrowRight']) {
    if (codeMap['Shift']) {
      const right=(messagesInputEl.selectionEnd==cur);
      if (cur<val.length) cur++;
      if (right) messagesInputEl.selectionEnd=cur;
      else messagesInputEl.selectionStart=cur;
    }
    else {
      cur=messagesInputEl.selectionEnd;
      if (cur<val.length) cur++;
      messagesInputEl.selectionStart=messagesInputEl.selectionEnd=cur;
    }
  }
}
