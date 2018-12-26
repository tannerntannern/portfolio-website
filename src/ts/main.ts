declare var $: any;

import regl from 'regl';

// @ts-ignore: parcel supports this
import pointVert from '../shaders/point.vert';
// @ts-ignore: parcel supports this
import pointFrag from '../shaders/point.frag';

import { Point, Line } from './classes';
import { debounce, distApprox2 } from './util';

// Attach regl to our canvas
let r = regl();

// Initialize canvas
function setup() {
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

	const drawPoints = r({
		frag: pointFrag,
		vert: pointVert,
		uniforms: {
			time: () => uniforms.time
		},
		attributes: {
			position: points,
			speed: speeds
		},
		primitive: 'points',
		count: points.length
	});

	// Render function
	r.frame(() => {
		uniforms.time += 0.005;

		r.clear({
			color: [1, 1, 1, 1],
			depth: 1,
			stencil: 0
		});

		drawPoints();
	});
}

// Setup once at the beginning
setup();
