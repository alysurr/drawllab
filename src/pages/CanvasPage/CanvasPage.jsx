import './CanvasPage.scss';
import React, { useLayoutEffect, useState } from 'react';
import rough from 'roughjs/bundled/rough.esm';

const generator = rough.generator();

function createElement(x1, y1, x2, y2, type) {
	const roughElement =
		type === "line"
			? generator.line(x1, y1, x2, y2)
			: generator.rectangle(x1, y1, x2 - x1, y2 - y1);
		// generator.circle(80, 120, 50);;
  return {x1, y1, x2, y2, roughElement};
}

const CanvasPage = () => {

  const [elements, setElements] = useState([]);
	const [drawing, setDrawing] = useState(false);
	const [elementType, setElementType] = useState("line")

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach(({roughElement}) => roughCanvas.draw(roughElement));
  }, [elements]);
  
  const handleMouseDown = (e) => {
    setDrawing(true);

    const { clientX, clientY } = e;

    const element = createElement(clientX, clientY, clientX, clientY, elementType);
    setElements((prevState) => [...prevState, element]);
  };
  
  const handleMouseMove = (e) => {
    if (!drawing) return;
    
    const { clientX, clientY } = e;
    const index = elements.length - 1;
    const { x1, y1 } = elements[index];
    const updatedElement = createElement(x1, y1, clientX, clientY, elementType);

    const elementsCopy = [...elements];
    elementsCopy[index] = updatedElement;
    setElements(elementsCopy);
  };
  
  const handleMouseUp = () => {
    setDrawing(false);
  };

  return (
		<>
			{/* Toolbar Component */}
			<div className="toolbar">
				<input
					type="radio"
					id="line"
					checked={elementType === "line"}
					onChange={() => setElementType("line")}
					className="tool"
				/>
				<label
					htmlFor="line"
					className="tool__label"
				>
					Line
				</label>
				<input
					type="radio"
					id="rectangle"
					checked={elementType === "rectangle"}
					onChange={() => setElementType("rectangle")}
					className="tool"
				/>
				<label
					htmlFor="rectangle"
					className="tool__label"
				>
					Rectangle
				</label>
			</div>
			{/* Canvas Component */}
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        Canvas
      </canvas>
    </>
  )
}

export default CanvasPage;
