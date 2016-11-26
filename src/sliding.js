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

// Base class for position and grid. No GUI here
class SlidingGrid {
  constructor(sizex, sizey) {
    this.resize(sizex, sizey);
  }

  // int -> int -> null
  resize(sizex, sizey) {
    this.sizex = sizex || 2;
    this.sizey = sizey || 3;
    if(sizex<1 || sizey<1 || sizex+sizey<=2) {
      throw new Error('Size too small to play!');
    }
    this.shuffle();
    this.showGrid();
  }

  // fills layout with solved state: 1, 2, ...sizex*sizey-1, 0
  reset() {
    this.layout = [];
    for(let i =0;i<this.sizex * this.sizey-1;i++)
      this.layout.push(i+1);
    this.layout.push(0);
  }

  // are we in the solved state?
  // null -> bool
  isFinished() {
    for (let i=0; i<this.sizex * this.sizey-1;i++) {
      if(this.layout[i]!==i+1) return false;
    }
    if(this.layout[this.sizex * this.sizey-1] !== 0) return false;
    return true;
  }
  
  // randomize layout. Output might not be solvable, so do not call directly.
  // Use shuffle() instead
  shuffle_() {
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    for(let i=this.layout.length-1;i>0;i--) {
      let j = Math.random()*i | 0;
      [this.layout[i], this.layout[j] ] = [this.layout[j], this.layout[i] ];
    }
  }
  
  // null -> bool
  isSolvable() {
    // http://kevingong.com/Math/SixteenPuzzle.html
    let inversions=0;
    for(let i=0; i<this.layout.length; i++) {
      if(this.layout[i]===0) continue;
      for(let j=i+1; j<this.layout.length; j++) {
        if(this.layout[j]===0) continue;
        if(this.layout[j]>this.layout[i]) continue;
        inversions++;
      }
    }
    // console.log(`Inversions: ${inversions}`);
    if(this.sizex%2==1) {
      return inversions%2===0;
    } else {
      const i = this.posToGrid(this.missingPos()).y+1;
      if ((this.sizey-i)%2===0 && inversions%2===0)
        return true;
      else if ((this.sizey-i)%2===1 && inversions%2===1)
        return true;
      else
        return false;
    }
  }

  // shuffle layout till it gets solvable and is not solved
  shuffle() {
    // init puzzle into a solved state, then randomize from there
    this.reset();
    for(let i=0; i<10000; i++) {
      this.shuffle_();
      if (this.isFinished()) continue;
      if (this.isSolvable()) break;
    }
  }
  
  // position of the missing tile
  // null -> int
  missingPos() {
    for (let pos=0; pos<this.layout.length; pos++)
      if(this.layout[pos]===0) return pos;
    console.log('We should not be here');
    return -1;
  }

  // {x,y} -> int
  gridToPos(grid) {
    return grid.y*this.sizex+grid.x;
  }
  
  // int -> {x,y}
  posToGrid(pos) {
    let x = this.sizex;
    return {x: pos % x, y: pos/x | 0 };
  }
  
  // prints out the grid on console for debugging purposes
  showGrid() {
    for(let i=0; i<this.sizey; i++) {
      let t = this.layout.slice(i*this.sizex,(i+1)*this.sizex);
      let s = t.join(' ');
      s=s.replace(/(^| )\d\b/g," $&");
      console.log(s);
    }
  }

  // can the missing tile slide to that position?
  // int -> bool  
  canSlideTo(pos) {
    const mp = this.missingPos();
    if (pos === mp) return false;
    const grMissing = this.posToGrid(mp);
    const grPos = this.posToGrid(pos);
    if(grPos.y === grMissing.y && Math.abs(grPos.x - grMissing.x) === 1)
      return true;
    else if(grPos.x === grMissing.x && Math.abs(grPos.y - grMissing.y) === 1)
      return true;
    else
      return false;
  }

  // move the missing tile to pos position.
  // call canSlideTo(.) before to make sure it is allowed to go there
  // int -> null
  slideTile(pos) {
    if (this.isFinished()) return;
    if (!this.canSlideTo(pos)) return;
    let mp = this.missingPos();
    [this.layout[mp], this.layout[pos]] =[this.layout[pos], this.layout[mp]];
  }  
}


// the GUI app that draws on canvas
class SlidingTiles extends SlidingGrid {
  constructor(selector, sizex, sizey, tileWidth) {
    super(sizex, sizey);
    if (!selector) return;
    this.canvas = document.querySelector(selector);
    if (!this.canvas) return;
    if (!this.canvas.getContext) {
      window.alert('Your browser does not support canvas.');
      return;
    }
    this.tileW(tileWidth);
  }

  // int -> int -> (bool) -> null
  resize(sizex, sizey, noRedraw) {
    super.resize(sizex, sizey);
    // in ES6 all methods are virtuals, so it might be called from super...
    if (!this.canvas || noRedraw === true) return;
    this.initView();
  }

  tileW(tileWidth) {
    tileWidth = tileWidth || 80; // in pixels
    if(tileWidth<=0)
      throw new Error("tileWidth too small");
    this.tileWidth = tileWidth;
    this.initView();
  }

  initView() {
    this.draw();
    this.eventCapture(true);
  }
  
  // {x,y} -> {x, y}
  pointToGrid(point) {
    let w = this.tileWidth;
    return {x: point.x/w | 0, y: point.y/w | 0};
  }
  
  // {x,y} -> {x, y}
  gridToPoint(grid) {
    let w = this.tileWidth;
    return {x: grid.x*w, y: grid.y*w};
  }
 
  // 2dcontext -> int -> null 
  drawTile(ctx, pos) {
    let w = this.tileWidth;
    let p = this.gridToPoint(this.posToGrid(pos));
    if (this.layout[pos]===0) {
      ctx.fillStyle = '#eee';
      ctx.fillRect(p.x, p.y, w, w);
    } else {
      ctx.fillStyle = '#ccc';
      ctx.fillRect(p.x, p.y, w, w);
      ctx.strokeStyle = '#eee';
      ctx.strokeRect(p.x, p.y, w, w);
      ctx.font = '30px monospace';
      ctx.textAlign = "center";
      ctx.textBaseline="middle";
      ctx.fillStyle = '#444';
      ctx.fillText(''+ this.layout[pos], p.x + w/2, p.y + w/2);
    }
  }
  
  draw() {
    let w = this.tileWidth;
    this.canvas.width = this.sizex * w + 2;
    this.canvas.height = this.sizey * w + 2;
    let ctx = this.canvas.getContext('2d');
    for (let i=0; i<this.layout.length; i++)
      this.drawTile(ctx,i);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(0, 0, w, w);
  }
  
  slideTile(pos) {
    let mp = this.missingPos();
    super.slideTile(pos);
    let ctx = this.canvas.getContext('2d');
    this.drawTile(ctx,mp);
    this.drawTile(ctx,pos);
    if (!this.isFinished()) return;
    window.alert("Congrats, you won!");
  }
 

  // capture click and keyup events if capture is true.
  // remove event listeners if false
  eventCapture(capture) {
    // click event handler 
    if (!this.handleClick) {
      this.handleClick = (ev) => {
        let rect = ev.target.getBoundingClientRect();
        let x = ev.clientX - rect.left;
        let y = ev.clientY - rect.top;
        let g = this.pointToGrid({x,y});
        let pos = this.gridToPos(g);
        this.slideTile(pos);
      };
    }

    // keyup event handler
    if (!this.handleKeyUp) {
      this.handleKeyUp = (ev) => {
        let gridm = this.posToGrid(this.missingPos());
        let p;
        if (ev.keyCode == '38' && gridm.y < this.sizey-1) {
          // up arrow
          p = this.gridToPos({x:gridm.x,y:gridm.y+1});
        } else if (ev.keyCode == '40' && gridm.y > 0) {
          // down arrow
          p = this.gridToPos({x:gridm.x,y:gridm.y-1});
        } else if (ev.keyCode == '37' && gridm.x < this.sizex-1) {
          // left arrow
          p = this.gridToPos({x:gridm.x+1,y:gridm.y});
        } else if (ev.keyCode == '39' && gridm.x>0) {
          // right arrow
          p = this.gridToPos({x:gridm.x-1,y:gridm.y});
        } else {
          return;
        }
        this.slideTile(p);
      };
    }

    this.canvas.removeEventListener('click', this.handleClick);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (!capture) return;

    this.canvas.addEventListener('click', this.handleClick, false);
    window.addEventListener('keyup', this.handleKeyUp, false);
  }
}

