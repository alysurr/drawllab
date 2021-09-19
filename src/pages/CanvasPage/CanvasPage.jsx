import './CanvasPage.scss';
import React, { useLayoutEffect, useState } from 'react';
import rough from 'roughjs/bundled/rough.esm';

// ----- icons for toolbar -----
import paintbrush from '../../assets/images/paintbrush.png';
import line from '../../assets/images/diagonal-line.png';
import square from '../../assets/images/square.png';
import selection from '../../assets/images/selection.png';

const generator = rough.generator();

function createElement(id, x1, y1, x2, y2, type) {
	const roughElement =
		type === "line"
			? generator.line(x1, y1, x2, y2)
			: generator.rectangle(x1, y1, x2 - x1, y2 - y1);
		// generator.circle(80, 120, 50);;
  return {id, x1, y1, x2, y2, type, roughElement};
}

const isWithinElement = (x, y, element) => {
	const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  } else {
		const a = { x: x1, y: y1 };
		const b = { x: x2, y: y2 };
		const c = { x, y };
		const offset = distance(a, b) - (distance(a, c) + distance(b, c));
		return Math.abs(offset) < 1;
  }
};

const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y-b.y, 2));

const getElementAtPosition = (x, y, elements) => {
	return elements.find(element => isWithinElement(x, y, element));
};

const adjustElementCoordinates = element => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

// ----- PAGE -----

const CanvasPage = () => {
	// ----- Set State -----
  const [elements, setElements] = useState([]);
	const [action, setAction] = useState("none");
	const [tool, setTool] = useState("line");
	const [selectedElement, setSelectedElement] = useState(null);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach(({roughElement}) => roughCanvas.draw(roughElement));
	}, [elements]);
	
	const updateElement = (id, x1, y1, x2, y2, type) => {
		const updatedElement = createElement(id, x1, y1, x2, y2, type);

		const elementsCopy = [...elements];
		elementsCopy[id] = updatedElement;
		setElements(elementsCopy);
	};
  
	const handleMouseDown = (e) => {
    const { clientX, clientY } = e;
		
		if (tool === "select") {
			const element = getElementAtPosition(clientX, clientY, elements)
			if (element) {
				const offsetX = clientX - element.x1;
				const offsetY = clientY - element.y1;
				setSelectedElement({...element, offsetX, offsetY})
				setAction("moving");
			}
		} else {
			const id = elements.length;
    const element = createElement(id, clientX, clientY, clientX, clientY, tool);
		setElements((prevState) => [...prevState, element]);
			
		setAction("drawing");

		}
  };
  
	const handleMouseMove = (e) => {
		const { clientX, clientY } = e;
		if (tool === "select") {
			e.target.style.cursor = getElementAtPosition(clientX, clientY, elements) ? "move" : "default";
		}

		if (action === "drawing") {
			const index = elements.length - 1;
			const { x1, y1 } = elements[index];
			updateElement(index, x1, y1, clientX, clientY, tool);
		} else if (action === "moving") {
			const { id, x1, y1, x2, y2, type, offsetX, offsetY } = selectedElement;
			const width = x2 - x1;
			const height = y2 - y1;
			const nexX1 = clientX - offsetX;
			const nexY1 = clientY - offsetY;
			updateElement(id, nexX1, nexY1, nexX1 + width, nexY1 + height, tool);
		
		}
  };
  
	const handleMouseUp = () => {
		const index = elements.length - 1;
		const { id, type } = elements[index];
		if (action === "drawing") {
			const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
			updateElement(id, x1, y1, x2, y2, type);
		}
		setAction("none");
		setSelectedElement(null);
  };

  return (
		<>
			{/* Toolbar Component */}
			<div className="toolbar">
				<input
					type="radio"
					id="line"
					checked={tool === "line"}
					onChange={() => setTool("line")}
					className="tool"
				/>
				<label
					htmlFor="line"
					for="line"
					className="tool__label"
				>
					<img src={line} alt="line icon" className="toolbar__logo"/>
				</label>
				<input
					type="radio"
					id="rectangle"
					checked={tool === "rectangle"}
					onChange={() => setTool("rectangle")}
					className="tool"
				/>
				<label
					htmlFor="rectangle"
					for="rectangle"
					className="tool__label"
				>
					<img src={square} alt="rectangle icon" className="toolbar__logo"/>
				</label>
				<input
					type="radio"
					id="select"
					checked={tool === "select"}
					onChange={() => setTool("select")}
					className="tool"
				/>
				<label
					htmlFor="select"
					for="select"
					className="tool__label"
				>
					<img src={selection} alt="selection icon" className="toolbar__logo"/>
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
