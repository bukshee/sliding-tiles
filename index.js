
var hasES6 = true;
try {
  new Function("'use strict'; const c = d => {}; for(let t of d){};")    ;
} catch(e){
  hasES6=false;
}
var s = document.createElement('script');
s.src = hasES6?'src/sliding.js':'src/sliding.es5.js';
document.head.appendChild(s);

window.onload = function() {
  SlidingTiles('#SlidingGame');
};

