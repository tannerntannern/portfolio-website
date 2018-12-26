declare var $: any;

import regl from 'regl';
import * as MainLoop from 'mainloop.js';

// @ts-ignore: parcel supports this
import vert from '../shaders/main.vert';
// @ts-ignore: parcel supports this
import frag from '../shaders/main.frag';

import { Point, Line } from './classes';
import { debounce, distApprox2 } from './util';

// Attach regl to our canvas
let r = regl();

// Initialize canvas
function setup() {
	// Stop the MainLoop if it was already running
	MainLoop.stop();

	// Get width and height
	let w = document.body.offsetWidth,
		h = window.innerHeight;

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
		accent: '#3172b4',
		primary: '#FFFFFF'
	};

	// Init Points
	let points = [],
		speeds = [],
		spd = 0.5, spd2 = spd / 2;
	for (let i = 0; i < numPoints; i ++){
		points[i] = [
			((2 * Math.random()) - 1) * (bigW / w),
			((2 * Math.random()) - 1) * (bigH / h)
		];
		speeds[i] = [
			(Math.random() * spd - spd2) + spd,
			Math.random() * spd - spd2
		];
	}

	let uniforms = {
		time: 0
	};

	// Update function
	function update(delta){
		uniforms.time += 0.005;
	}

	// Render function
	function render() {
		r.clear({
			color: [1, 1, 1, 1],
			depth: 1,
			stencil: 0
		});

		r({
			frag: frag,
			vert: vert,
			uniforms: uniforms,
			attributes: {
				position: points,
				speed: speeds
			},
			primitive: 'lines',
			count: points.length
		})();
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
