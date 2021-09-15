import './App.scss';
import React, { useLayoutEffect, useState } from 'react';
import rough from 'roughjs/bundled/rough.esm';

const App = () => {

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const roughCanvas = rough.canvas(canvas);
    roughCanvas.rectangle(10, 10, 50, 50)
  });
  
  return (
    <canvas id="canvas" width={window.innerWidth} height={window.innerHeight}>
      Canvas
    </canvas>)
  

}

export default App;
