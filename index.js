
var hasES6 = true;
try {
  new Function("'use strict'; class t{}; const c = d => {}; for(let t of d){};")    ;
} catch(e){
  hasES6=false;
}
var s = document.createElement('script');
s.src = hasES6?'src/sliding.js':'src/sliding.es5.js';
document.head.appendChild(s);


window.onload = function() {
  var app = new SlidingTiles('#SlidingGame', 2, 3);
  var handleForm = function(ev) {
    var s = document.querySelector('select');
    var dim = s.options[s.selectedIndex].value.split('x');
    if (ev) {
      ev.preventDefault();
    }
    app.resize(dim[0], dim[1]);
    return false;
  };
  document.querySelector('button').addEventListener('click', handleForm);
};

