import { Point, Line } from './classes';
import { MainLoop } from './mainloop';
import { debounce, distApprox2 } from './util';
declare var $: any;

// Initialize canvas demo
function setup() {
	// Stop the MainLoop if it was already running
	MainLoop.stop();

	// Grab canvas context
	let c = document.querySelector('canvas').getContext('2d');

	// Get width and height
	let w = window.innerWidth,
		h = window.innerHeight;

	// Set width and height
	c.canvas.width = w;
	c.canvas.height = h;

	// Global vars
	let ptDist = 130,
		pixelsPerPoint = 1900,
		numPointsMax = 1000,
		numPoints = Math.min(Math.round((w * h) / pixelsPerPoint), numPointsMax),
		edgeX = w + ptDist,
		edgeY = h + ptDist,
		bigW = w + (2 * ptDist),
		bigH = h + (2 * ptDist);

	// Init colors
	let colors = {
		primary: '#347FC4',
		accent: '#FFFFFF',
		background1: '#1e1e3c',
		background2: '#1c3f4a',
		points: '#ffe699',
		connectors: '#f8ffbe'
	};

	// Init Points
	let points = [], spd = 0.5, spd2 = spd / 2;
	for (let i = 0; i < numPoints; i ++){
		points[i] = new Point(
			Math.random() * bigW,
			Math.random() * bigH,
			(Math.random() * spd - spd2) + spd,
			Math.random() * spd - spd2
		);
	}

	// Init Lines
	let lines = [];
	for (let i = 0; i < numPoints; i ++) {
		for (let j = i; j < numPoints; j ++) {
			lines.push(new Line(points[i], points[j]));
		}
	}

	// Pre-calculate values to cut down on render time
	let grd = c.createLinearGradient(0, 0, w, h);
	grd.addColorStop(0, colors.background1);
	grd.addColorStop(1, colors.background2);

	// Update function
	function update(delta){
		// Normalize delta
		delta /= 20;

		// Update point locations
		for (let pt of points) {
			pt.x += delta * pt.xSpeed;
			pt.y += delta * pt.ySpeed;

			if (pt.x < -ptDist) pt.x += bigW;
			if (pt.x > edgeX) pt.x -= bigW;
			if (pt.y < -ptDist) pt.y += bigH;
			if (pt.y > edgeY) pt.y -= bigH;
		}
	}

	// Render function
	function render() {
		// Background
		c.fillStyle = grd;
		c.fillRect(-1, -1, w + 2, h + 2);

		// Render points
		c.fillStyle = colors.points;
		for (let pt of points){
			c.fillRect(pt.x, pt.y, 2, 2);
		}

		// Render point connectors
		c.strokeStyle = colors.connectors;
		for (let ln of lines){
			let p1 = ln.p1, p2 = ln.p2,
				lineLengthApprox = distApprox2(p1, p2);

			if (lineLengthApprox < ptDist){
				c.globalAlpha = 1 - (lineLengthApprox / ptDist);
				c.beginPath();
				c.moveTo(p1.x, p1.y);
				c.lineTo(p2.x, p2.y);
				c.stroke();
			}
		}
		c.globalAlpha = 1;
	}

	// Kick off main loop
	MainLoop
		.setMaxAllowedFPS(80)
		.setUpdate(update)
		.setDraw(render)
		.start();
}

// Setup once at the beginning
setup();

$(window)
	.on('resize', debounce(setup, 200))
	.on("blur focus", function(e) {
		let prevType = $(this).data("prevType");

		if (prevType != e.type) {
			switch (e.type) {
				case "blur":
					MainLoop.stop();
					break;
				case "focus":
					MainLoop.start();
					break;
			}
		}

		$(this).data("prevType", e.type);
	});