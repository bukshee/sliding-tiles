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

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SlidingGrid = function () {
  function SlidingGrid(sizex, sizey) {
    _classCallCheck(this, SlidingGrid);

    this.resize(sizex, sizey);
  }

  // int -> int -> null


  _createClass(SlidingGrid, [{
    key: 'resize',
    value: function resize(sizex, sizey) {
      this.sizex = sizex || 2;
      this.sizey = sizey || 3;
      if (sizex < 1 || sizey < 1 || sizex + sizey <= 2) {
        throw new Error('Size too small to play!');
      }
      this.shuffle();
      this.showGrid();
    }

    // fills layout with solved state: 1, 2, ...sizex*sizey-1, 0

  }, {
    key: 'reset',
    value: function reset() {
      this.layout = [];
      for (var i = 0; i < this.sizex * this.sizey - 1; i++) {
        this.layout.push(i + 1);
      }this.layout.push(0);
    }

    // are we in the solved state?
    // null -> bool

  }, {
    key: 'isFinished',
    value: function isFinished() {
      for (var i = 0; i < this.sizex * this.sizey - 1; i++) {
        if (this.layout[i] !== i + 1) return false;
      }
      if (this.layout[this.sizex * this.sizey - 1] !== 0) return false;
      return true;
    }

    // randomize layout. Output might not be solvable, so do not call directly.
    // Use shuffle() instead

  }, {
    key: 'shuffle_',
    value: function shuffle_() {
      // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
      for (var i = this.layout.length - 1; i > 0; i--) {
        var j = Math.random() * i | 0;
        var _ref = [this.layout[j], this.layout[i]];
        this.layout[i] = _ref[0];
        this.layout[j] = _ref[1];
      }
    }

    // null -> bool

  }, {
    key: 'isSolvable',
    value: function isSolvable() {
      // http://kevingong.com/Math/SixteenPuzzle.html
      var inversions = 0;
      for (var i = 0; i < this.layout.length; i++) {
        if (this.layout[i] === 0) continue;
        for (var j = i + 1; j < this.layout.length; j++) {
          if (this.layout[j] === 0) continue;
          if (this.layout[j] > this.layout[i]) continue;
          inversions++;
        }
      }
      // console.log(`Inversions: ${inversions}`);
      if (this.sizex % 2 == 1) {
        return inversions % 2 === 0;
      } else {
        var _i = this.posToGrid(this.missingPos()).y + 1;
        if ((this.sizey - _i) % 2 === 0 && inversions % 2 === 0) return true;else if ((this.sizey - _i) % 2 === 1 && inversions % 2 === 1) return true;else return false;
      }
    }

    // shuffle layout till it gets solvable and is not solved

  }, {
    key: 'shuffle',
    value: function shuffle() {
      // init puzzle into a solved state, then randomize from there
      this.reset();
      for (var i = 0; i < 10000; i++) {
        this.shuffle_();
        if (this.isFinished()) continue;
        if (this.isSolvable()) break;
      }
    }

    // position of the missing tile
    // null -> int

  }, {
    key: 'missingPos',
    value: function missingPos() {
      for (var pos = 0; pos < this.layout.length; pos++) {
        if (this.layout[pos] === 0) return pos;
      }console.log('We should not be here');
      return -1;
    }

    // {x,y} -> int

  }, {
    key: 'gridToPos',
    value: function gridToPos(grid) {
      return grid.y * this.sizex + grid.x;
    }

    // int -> {x,y}

  }, {
    key: 'posToGrid',
    value: function posToGrid(pos) {
      var x = this.sizex;
      return { x: pos % x, y: pos / x | 0 };
    }

    // prints out the grid on console for debugging purposes

  }, {
    key: 'showGrid',
    value: function showGrid() {
      for (var i = 0; i < this.sizey; i++) {
        var t = this.layout.slice(i * this.sizex, (i + 1) * this.sizex);
        var s = t.join(' ');
        s = s.replace(/(^| )\d\b/g, " $&");
        console.log(s);
      }
    }

    // can the missing tile slide to that position?
    // int -> bool  

  }, {
    key: 'canSlideTo',
    value: function canSlideTo(pos) {
      var mp = this.missingPos();
      if (pos === mp) return false;
      var grMissing = this.posToGrid(mp);
      var grPos = this.posToGrid(pos);
      if (grPos.y === grMissing.y && Math.abs(grPos.x - grMissing.x) === 1) return true;else if (grPos.x === grMissing.x && Math.abs(grPos.y - grMissing.y) === 1) return true;else return false;
    }

    // move the missing tile to pos position.
    // call canSlideTo(.) before to make sure it is allowed to go there
    // int -> null

  }, {
    key: 'slideTile',
    value: function slideTile(pos) {
      if (this.isFinished()) return;
      if (!this.canSlideTo(pos)) return;
      var mp = this.missingPos();
      var _ref2 = [this.layout[pos], this.layout[mp]];
      this.layout[mp] = _ref2[0];
      this.layout[pos] = _ref2[1];
    }
  }]);

  return SlidingGrid;
}();

// the GUI app that draws on canvas


var SlidingTiles = function (_SlidingGrid) {
  _inherits(SlidingTiles, _SlidingGrid);

  function SlidingTiles(selector, sizex, sizey, tileWidth) {
    _classCallCheck(this, SlidingTiles);

    var _this = _possibleConstructorReturn(this, (SlidingTiles.__proto__ || Object.getPrototypeOf(SlidingTiles)).call(this, sizex, sizey));

    if (!selector) return _possibleConstructorReturn(_this);
    _this.canvas = document.querySelector(selector);
    if (!_this.canvas) return _possibleConstructorReturn(_this);
    if (!_this.canvas.getContext) {
      window.alert('Your browser does not support canvas.');
      return _possibleConstructorReturn(_this);
    }
    _this.tileW(tileWidth);
    return _this;
  }

  // int -> int -> (bool) -> null


  _createClass(SlidingTiles, [{
    key: 'resize',
    value: function resize(sizex, sizey, noRedraw) {
      _get(SlidingTiles.prototype.__proto__ || Object.getPrototypeOf(SlidingTiles.prototype), 'resize', this).call(this, sizex, sizey);
      // in ES6 all methods are virtuals, so it might be called from super...
      if (!this.canvas || noRedraw === true) return;
      this.initView();
    }
  }, {
    key: 'tileW',
    value: function tileW(tileWidth) {
      tileWidth = tileWidth || 80; // in pixels
      if (tileWidth <= 0) throw new Error("tileWidth too small");
      this.tileWidth = tileWidth;
      this.initView();
    }
  }, {
    key: 'initView',
    value: function initView() {
      this.draw();
      this.eventCapture(true);
    }

    // {x,y} -> {x, y}

  }, {
    key: 'pointToGrid',
    value: function pointToGrid(point) {
      var w = this.tileWidth;
      return { x: point.x / w | 0, y: point.y / w | 0 };
    }

    // {x,y} -> {x, y}

  }, {
    key: 'gridToPoint',
    value: function gridToPoint(grid) {
      var w = this.tileWidth;
      return { x: grid.x * w, y: grid.y * w };
    }

    // 2dcontext -> int -> null 

  }, {
    key: 'drawTile',
    value: function drawTile(ctx, pos) {
      var w = this.tileWidth;
      var p = this.gridToPoint(this.posToGrid(pos));
      if (this.layout[pos] === 0) {
        ctx.fillStyle = '#eee';
        ctx.fillRect(p.x, p.y, w, w);
      } else {
        ctx.fillStyle = '#ccc';
        ctx.fillRect(p.x, p.y, w, w);
        ctx.strokeStyle = '#eee';
        ctx.strokeRect(p.x, p.y, w, w);
        ctx.font = '30px monospace';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = '#444';
        ctx.fillText('' + this.layout[pos], p.x + w / 2, p.y + w / 2);
      }
    }
  }, {
    key: 'draw',
    value: function draw() {
      var w = this.tileWidth;
      this.canvas.width = this.sizex * w + 2;
      this.canvas.height = this.sizey * w + 2;
      var ctx = this.canvas.getContext('2d');
      for (var i = 0; i < this.layout.length; i++) {
        this.drawTile(ctx, i);
      }ctx.strokeStyle = '#fff';
      ctx.strokeRect(0, 0, w, w);
    }
  }, {
    key: 'slideTile',
    value: function slideTile(pos) {
      var mp = this.missingPos();
      _get(SlidingTiles.prototype.__proto__ || Object.getPrototypeOf(SlidingTiles.prototype), 'slideTile', this).call(this, pos);
      var ctx = this.canvas.getContext('2d');
      this.drawTile(ctx, mp);
      this.drawTile(ctx, pos);
      if (!this.isFinished()) return;
      window.alert("Congrats, you won!");
    }

    // capture click and keyup events if capture is true.
    // remove event listeners if false

  }, {
    key: 'eventCapture',
    value: function eventCapture(capture) {
      var _this2 = this;

      // click event handler 
      if (!this.handleClick) {
        this.handleClick = function (ev) {
          var rect = ev.target.getBoundingClientRect();
          var x = ev.clientX - rect.left;
          var y = ev.clientY - rect.top;
          var g = _this2.pointToGrid({ x: x, y: y });
          var pos = _this2.gridToPos(g);
          _this2.slideTile(pos);
        };
      }

      // keyup event handler
      if (!this.handleKeyUp) {
        this.handleKeyUp = function (ev) {
          var gridm = _this2.posToGrid(_this2.missingPos());
          var p = void 0;
          if (ev.keyCode == '38' && gridm.y < _this2.sizey - 1) {
            // up arrow
            p = _this2.gridToPos({ x: gridm.x, y: gridm.y + 1 });
          } else if (ev.keyCode == '40' && gridm.y > 0) {
            // down arrow
            p = _this2.gridToPos({ x: gridm.x, y: gridm.y - 1 });
          } else if (ev.keyCode == '37' && gridm.x < _this2.sizex - 1) {
            // left arrow
            p = _this2.gridToPos({ x: gridm.x + 1, y: gridm.y });
          } else if (ev.keyCode == '39' && gridm.x > 0) {
            // right arrow
            p = _this2.gridToPos({ x: gridm.x - 1, y: gridm.y });
          } else {
            return;
          }
          _this2.slideTile(p);
        };
      }

      this.canvas.removeEventListener('click', this.handleClick);
      window.removeEventListener('keyup', this.handleKeyUp);
      if (!capture) return;

      this.canvas.addEventListener('click', this.handleClick, false);
      window.addEventListener('keyup', this.handleKeyUp, false);
    }
  }]);

  return SlidingTiles;
}(SlidingGrid);