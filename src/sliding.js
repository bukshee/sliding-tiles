/*
 * Sliding tiles game for demoing canvas
 *
 * By Bukshee
 *
 * Home page : bukshee.github.io/sliding-tiles/
 * License   : GPL
 *
 * How it works:
 * We have sizex*sizey numbers. They each default to 4, so we have a total of
 * 16 numbers from 0 to 15. The tile named 0 is the "missing" one. So we have a
 * one-dimensional array called layout that store the numbers. We map this to
 * a grid to get 2 dimension positions. Finally points are pixels from the
 * top-left corner of canvas.
 * init() starts with the solved state, then shuffles the numbers randomly till
 * it get solvable. Then prints the layout on the canvas and the game begins.
 * The aim of the game is to get back into the solved state.
 */
"use strict";

function SlidingTiles(selector, sizex, sizey, tileWidth) {
  if (!selector) return;
  let canvas = document.querySelector(selector);
  if (!canvas) return;
  if (!canvas.getContext) {
    window.alert('Your browser does not support canvas.');
    return;
  }
  if(sizex<1 || sizey<1 || sizex+sizey<=2){
    console.log('Size too small to play!');
    return;
  }
  sizex = sizex || 2;
  sizey = sizey || 3;
  tileWidth = tileWidth || 80; // in pixels
  
  // model
  let layout = [];
  
  // solved state with 0 at the end
  const reset = () => {
    for(let i =0;i<sizex*sizey-1;i++)
      layout.push(i+1);
    layout.push(0);
  };
  
  const isFinished = () => {
    for (let i=0; i<sizex*sizey-1;i++) {
      if(layout[i]!==i+1) return false;
    }
    if(layout[sizex*sizey-1] !== 0) return false;
    return true;
  };
  
  const shuffle = () => {
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    for(let i=layout.length-1;i>0;i--) {
      let j = Math.random()*i | 0;
      [layout[i], layout[j] ] = [layout[j], layout[i] ];
    }
  };
  
  const isSolvable = () => {
    // http://kevingong.com/Math/SixteenPuzzle.html
    let inversions=0;
    for(let i=0; i<layout.length; i++) {
      if(layout[i]===0) continue;
      for(let j=i+1; j<layout.length; j++) {
        if(layout[j]===0) continue;
        if(layout[j]>layout[i]) continue;
        inversions++;
      }
    }
    // console.log(`Inversions: ${inversions}`);
    if(sizex%2==1) {
      return inversions%2===0;
    } else {
      const i = posToGrid(missingPos()).y+1;
      if ((sizey-i)%2===0 && inversions%2===0)
        return true;
      else if ((sizey-i)%2===1 && inversions%2===1)
        return true;
      else
        return false;
    }
  };
  
  // position of the missing tile
  const missingPos = () => {
    for (let pos=0; pos<layout.length; pos++)
      if(layout[pos]===0) return pos;
    console.log('We should not be here');
    return -1;
  };
  
  const pointToGrid = (point) => {
    return {x: (point.x-1)/tileWidth | 0, y: (point.y-1)/tileWidth | 0};
  };
  
  const gridToPoint = (grid) => {
    return {x: grid.x*tileWidth+1, y: grid.y*tileWidth+1};
  };
  
  const gridToPos = (grid) => {
    return grid.y*sizex+grid.x;
  };
  
  const posToGrid = (pos) => {
    return {x: pos % sizex, y: pos/sizex | 0 };
  };
  
  // prints out the grid on console for debugging purposes
  const showGrid = () => {
    for(let i=0;i<sizey;i++) {
      let t= layout.slice(i*sizex,(i+1)*sizex);
      let s = t.join(' ');
      s=s.replace(/(^| )\d\b/g," $&");
      console.log(s);
    }
  };
  
  const canSlideTo = (pos) => {
    const mp = missingPos();
    if (pos === mp) return false;
    const grMissing = posToGrid(mp);
    const grPos = posToGrid(pos);
    if(grPos.y === grMissing.y && Math.abs(grPos.x - grMissing.x) === 1)
      return true;
    else if(grPos.x === grMissing.x && Math.abs(grPos.y - grMissing.y) === 1)
      return true;
    else
      return false;
  };
  
  const drawTile = (ctx, pos) => {
    let p = gridToPoint(posToGrid(pos));
    if (layout[pos]===0) {
      ctx.fillStyle = '#eee';
      ctx.fillRect(p.x, p.y, tileWidth, tileWidth);
    } else {
      ctx.fillStyle = '#ccc';
      ctx.fillRect(p.x, p.y, tileWidth, tileWidth);
      ctx.strokeStyle = '#eee';
      ctx.strokeRect(p.x, p.y, tileWidth, tileWidth);
      ctx.font = '30px monospace';
      ctx.textAlign = "center";
      ctx.textBaseline="middle";
      ctx.fillStyle = '#444';
      ctx.fillText(''+layout[pos],p.x+tileWidth/2, p.y+tileWidth/2);
    }
  };
  
  const draw = () => {
    canvas.width = sizex * tileWidth+2;
    canvas.height = sizey * tileWidth+2;
    let ctx = canvas.getContext('2d');
    for (let i=0;i<layout.length;i++)
      drawTile(ctx,i);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(0, 0, tileWidth+1, tileWidth+1);
  };
  
  const slideTile = (pos) => {
    if (isFinished()) return;
    if (!canSlideTo(pos)) return;
    let mp = missingPos();
    [layout[mp], layout[pos]] =[layout[pos], layout[mp]];
    let ctx = canvas.getContext('2d');
    drawTile(ctx,mp);
    drawTile(ctx,pos);
    if (!isFinished()) return;
    window.alert("Congrats, you won!");
  };
  
  const init = () => {
    // init puzzle into a solved state, then randomize from there
    reset();
    for(let i=0;i<10000;i++) {
      shuffle();
      if (isSolvable()) break;
    }
    showGrid();
    draw();
    canvas.addEventListener('click', (ev) => {
      let rect = ev.target.getBoundingClientRect();
      let x = ev.clientX - rect.left;
      let y = ev.clientY - rect.top;
      let g = pointToGrid({x,y});
      let pos = gridToPos(g);
      slideTile(pos);
    }, false);
    
    window.addEventListener('keyup', (ev) => {
      let gridm = posToGrid(missingPos());
      let p;
      if (ev.keyCode == '38' && gridm.y<sizey-1) {
        // up arrow
        p = gridToPos({x:gridm.x,y:gridm.y+1});
      } else if (ev.keyCode == '40' && gridm.y>0) {
        // down arrow
        p = gridToPos({x:gridm.x,y:gridm.y-1});
      } else if (ev.keyCode == '37' && gridm.x<sizex-1) {
        // left arrow
        p = gridToPos({x:gridm.x+1,y:gridm.y});
      } else if (ev.keyCode == '39' && gridm.x>0) {
        // right arrow
        p = gridToPos({x:gridm.x-1,y:gridm.y});
      } else {
        return;
      }
      slideTile(p);
    }, false);
  };
  
  init();
  return;
}
