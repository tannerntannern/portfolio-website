declare var $: any;

import regl from 'regl';

// @ts-ignore: parcel supports this
import defaultVert from '../shaders/default.vert';
// @ts-ignore: parcel supports this
import defaultFrag from '../shaders/default.frag';
// @ts-ignore: parcel supports this
import pointVert from '../shaders/point.vert';
// @ts-ignore: parcel supports this
import pointFrag from '../shaders/point.frag';

import { debounce, distApprox2, randomRange, hexToVec } from './util';

// Attach regl to our canvas
let r = regl();

// Initialize canvas
function setup() {
	// Get width and height
	let w = document.body.offsetWidth,
		h = window.innerHeight;

	// Global vars
	let ptDist = 0.1,
		sizeWithPadding = 1 + ptDist,
		pixelsPerPoint = 1900,
		numPointsMax = 1000,
		numPoints = Math.min(Math.round((w * h) / pixelsPerPoint), numPointsMax),
		maxSpd = 0.5,
		minSpd = maxSpd / 2;

	// Init colors
	let colors = {
		accent: '#3172b4',
		primary: '#ffffff'
	};

	// Init Points
	let points = [], speeds = [], sizes = [];
	for (let i = 0; i < numPoints; i ++){
		points[i] = [
			randomRange(-sizeWithPadding, sizeWithPadding),
			randomRange(-sizeWithPadding, sizeWithPadding)
		];
		speeds[i] = [
			randomRange(minSpd, maxSpd),
			randomRange(-minSpd, minSpd)
		];
		sizes[i] = randomRange(2.0, 5.0);
	}

	let dynamicUniforms = {
			time: 0
		},
		constantUniforms = {
			size: sizeWithPadding,
			fullSize: sizeWithPadding * 2,
			xDivide: 0
		};

	const drawBg = r({
		vert: defaultVert,
		frag: defaultFrag,
		uniforms: {
			...constantUniforms,
			color1: hexToVec(colors.accent),
			color2: hexToVec(colors.primary)
		},
		attributes: {
			position: [[-1, 1], [1, 1], [-1, -1], [1, -1]]
		},
		primitive: 'triangle strip',
		count: 4
	});

	const drawPoints = r({
		vert: pointVert,
		frag: pointFrag,
		uniforms: {
			time: () => dynamicUniforms.time,
			...constantUniforms,
			color1: hexToVec(colors.primary),
			color2: hexToVec(colors.accent)
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
		dynamicUniforms.time += 0.002;

		r.clear({
			color: [1, .5, 1, 1],
			depth: 1,
			stencil: 0
		});

		drawPoints();
		drawBg();
	});
}

// Setup once at the beginning
setup();
