
var hasES6 = true;
try {
  new Function("'use strict'; const c = d => {}; for(let t of d){};")    ;
} catch(e){
  hasES6=false;
}
var s = document.createElement('script');
s.src = hasES6?'src/sliding.js':'src/sliding.es5.js';
document.head.appendChild(s);

function start(ev) {
  var s = document.querySelector('select');
  var dim = s.options[s.selectedIndex].value.split('x');
  SlidingTiles('#SlidingGame', dim[0], dim[1]);
  if (ev) {
    ev.preventDefault();
  }
  return false;
}

window.onload = function() {
  //start();
  SlidingTiles('#SlidingGame');
  //document.querySelector('button').addEventListener('click', start);
};

