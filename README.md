# Sliding tiles game for demoing canvas
 
By Bukshee

Home page : [Visit](http://bukshee.github.io/sliding-tiles/)
License   : GPL

## How it works:

 We have sizex*sizey numbers. They each default to 4, so we have a total of
16 numbers from 0 to 15. The tile named 0 is the "missing" one. So we have a
one-dimensional array called layout that store the numbers. We map this to
a grid to get 2 dimension positions. Finally points are pixels from the
top-left corner of canvas.
init() starts with the solved state, then shuffles the numbers randomly till
it get solvable. Then prints the layout on the canvas and the game begins.
The aim of the game is to get back into the solved state.

