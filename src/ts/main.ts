import regl from 'regl';

// @ts-ignore: parcel supports this
import defaultVert from '../shaders/default.vert';
// @ts-ignore: parcel supports this
import defaultFrag from '../shaders/default.frag';
// @ts-ignore: parcel supports this
// import pointSimVert from '../shaders/point-sim.vert';
// @ts-ignore: parcel supports this
// import pointSimFrag from '../shaders/point-sim.frag';
// @ts-ignore: parcel supports this
import pointVert from '../shaders/point.vert';
// @ts-ignore: parcel supports this
import pointFrag from '../shaders/point.frag';

// Collect our shaders into one object to organize them, and to allow substitutions to be made
const shaders = {
	default: { vert: defaultVert, frag: defaultFrag },
	// pointSim: { vert: pointSimVert, frag: pointSimFrag },
	point: { vert: pointVert, frag: pointFrag }
};

import {randomRange, hexToVec, nearestUpperPowerOf2, createImageFromTexture, reglUniformArray} from './util';

// Attach regl to our canvas
let r = regl({
	extensions: ['OES_texture_float']
});

// Get width and height
let w = document.body.offsetWidth,
	h = window.innerHeight;

// Global vars
const ptDist = 0.1,
	pixelsPerPoint = 1200,
	maxPoints = 2000,
	maxSpd = 0.5,
	minSpd = maxSpd / 2,
	colors = {
		accent: '#3172b4',
		primary: '#ffffff'
	};

let sizeWithPadding = 1 + ptDist,
	numPoints = Math.min(Math.round((w * h) / pixelsPerPoint), maxPoints),
	pointTextureSize = Math.ceil(Math.sqrt(numPoints)),
	distanceTextureSize = Math.ceil(numPoints / 8);

// Because GLSL ES 2.0 is terrible, we have to manually substitute in numPoints
shaders.point.vert = shaders.point.vert.replace('#define NUM_POINTS 100', '#define NUM_POINTS ' + numPoints);

// Generate a bunch of points at random positions moving at random speeds
let pointData = [];
for (let i = 0; i < numPoints; i ++){
	pointData.push(
		randomRange(-sizeWithPadding, sizeWithPadding),		// x position
		randomRange(-sizeWithPadding, sizeWithPadding),		// y position
		randomRange(minSpd, maxSpd),						// x speed
		randomRange(-minSpd, minSpd)						// y speed
	);
}

// Push in all-0-points to fill in the remaining texture-space
let leftOverSpace = (pointTextureSize ** 2) - numPoints;
for (let i = 0; i < leftOverSpace; i ++) {
	pointData.push(0.0, 0.0, 0.0, 0.0);
}

// Save the generated points as a texture (r=x, b=y, g=dx, a=dy)
let pointTexture = r.texture({
	width: pointTextureSize,
	height: pointTextureSize,
	format: 'rgba',
	type: 'float',
	data: pointData
});

// @ts-ignore
// console.log(createImageFromTexture(r._gl, pointTexture._texture.texture, pointTextureSize, pointTextureSize));

// TODO: generate distanceTexture

// Generate point and line "pointers" to be used by the shaders; These "pointers" will be used to lookup the actual
// coordinates on the textures kept in GPU memory
let points = [], lines = [];
for (let i = 0; i < numPoints; i ++) {
	points.push(i);

	for (let j = i; j < numPoints; j ++) {
		lines.push(i, j);
	}
}

// Pre-compute the texture coordinates for each point since the textures will be used for lookups constantly
let pointTextureXCoords = [],
	pointTextureYCoords = [],
	distanceTextureCoordMap = [];
for (let i = 0; i < numPoints; i ++) {
	pointTextureXCoords[i] = (i % pointTextureSize) / pointTextureSize;
	pointTextureYCoords[i] = Math.floor(i / pointTextureSize) / pointTextureSize;
}

// TODO: compute distance coordinates

let dynamicUniforms = {
		// ...
	},
	constantUniforms = {
		pointTexture: pointTexture,
		...reglUniformArray('pointTextureXCoords', pointTextureXCoords),
		...reglUniformArray('pointTextureYCoords', pointTextureYCoords),
		canvasWidth: sizeWithPadding,
		fullCanvasWidth: sizeWithPadding * 2,
		xDivide: 0
	};

const drawBg = r({
	vert: shaders.default.vert,
	frag: shaders.default.frag,
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
	vert: shaders.point.vert,
	frag: shaders.point.frag,
	uniforms: {
		...constantUniforms,
		color1: hexToVec(colors.primary),
		color2: hexToVec(colors.accent)
	},
	attributes: {
		index: points,
	},
	primitive: 'points',
	count: numPoints
});

// Render function
r.frame(() => {
	r.clear({
		color: [1, 1, 1, 1],
		depth: 1,
		stencil: 0
	});

	drawPoints();
	drawBg();
});
