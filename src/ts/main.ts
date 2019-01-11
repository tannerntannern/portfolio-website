import regl from 'regl';

// @ts-ignore: parcel supports this
import defaultVert from '../shaders/default.vert';
// @ts-ignore: parcel supports this
import defaultFrag from '../shaders/default.frag';
// @ts-ignore: parcel supports this
import pointSimVert from '../shaders/point-sim.vert';
// @ts-ignore: parcel supports this
import pointSimFrag from '../shaders/point-sim.frag';
// @ts-ignore: parcel supports this
import pointVert from '../shaders/point.vert';
// @ts-ignore: parcel supports this
import pointFrag from '../shaders/point.frag';

import {DoubleFBO} from './double-buffer';
import {randomRange, hexToVec, reglUniformArray, createImageFromTexture} from './util';

// Collect our shaders into one object to organize them, and to allow substitutions to be made
const shaders = {
	default: { vert: defaultVert, frag: defaultFrag },
	pointSim: { vert: pointSimVert, frag: pointSimFrag },
	point: { vert: pointVert, frag: pointFrag }
};

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
	maxSpd = 0.002,
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
shaders.pointSim.vert = shaders.pointSim.vert.replace('#define NUM_POINTS 100', '#define NUM_POINTS ' + numPoints);

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
let pointFBO = new DoubleFBO(r, {
	width: pointTextureSize,
	height: pointTextureSize,
	format: 'rgba',
	type: 'float',
	data: pointData
});

function print(fb) {
	// @ts-ignore
	console.log(createImageFromTexture(r._gl, fb.color[0]));
}

// TODO: not sure if we'll actually need this
let distanceFBO = new DoubleFBO(r, {
	width: distanceTextureSize,
	height: distanceTextureSize,
	format: 'rgba',
	type: 'float'
});

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
let pointFBOCoords = [], distanceFBOCoords = [];
for (let i = 0; i < numPoints; i ++) {
	// The 0.5 ensures that we use the center of the pixel rather than the top left
	pointFBOCoords[i] = [
		((i % pointTextureSize) + 0.5) / pointTextureSize,
		(Math.floor(i / pointTextureSize) + 0.5) / pointTextureSize
	];
}

// TODO: compute distance coordinates

let dynamicUniforms = {
		pointTexture: () => pointFBO.current,
		distanceTexture: () => distanceFBO.current,
	},
	constantUniforms = {
		...reglUniformArray('pointFBOCoords', pointFBOCoords),
		...reglUniformArray('distanceFBOCoords', distanceFBOCoords),
		canvasWidth: sizeWithPadding,
		fullCanvasWidth: sizeWithPadding * 2,
		xDivide: 0
	};

const simulatePoints = r({
	vert: shaders.pointSim.vert,
	frag: shaders.pointSim.frag,
	framebuffer: () => pointFBO.next,
	uniforms: {
		...dynamicUniforms,
		...constantUniforms
	},
	attributes: {
		index: points
	},
	primitive: 'points',
	count: numPoints
});

const calculateDistances = r({});

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

const drawLines = r({});

const drawPoints = r({
	vert: shaders.point.vert,
	frag: shaders.point.frag,
	uniforms: {
		...dynamicUniforms,
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
// window.onkeypress = function() {
	r.clear({
		color: [1, 1, 1, 1],
		depth: 1,
		stencil: 0
	});

	drawPoints();
	// drawLines();
	drawBg();

	// print(pointFBO.current);
	// print(pointFBO.next);
	simulatePoints();

	pointFBO.swap();
	distanceFBO.swap();
// };
});


// const pointWidth = 3;
//
// const animationTickLimit = -1; // -1 disables
// if (animationTickLimit >= 0) {
// 	console.log(`Limiting to ${animationTickLimit} ticks`);
// }
//
// const sqrtNumParticles = 64;
// const numParticles = sqrtNumParticles * sqrtNumParticles;
// console.log(`Using ${numParticles} particles`);
//
// // initialize regl
// const r = regl({
// 	// need this to use the textures as states
// 	extensions: 'OES_texture_float',
// });
//
//
// // initial particles state and texture for buffer
// // multiply by 4 for R G B A
// const initialParticleState = new Float32Array(numParticles * 4);
// for (let i = 0; i < numParticles; ++i) {
// 	// store x then y and then leave 2 spots empty
// 	initialParticleState[i * 4] = 2 * Math.random() - 1; // x position
// 	initialParticleState[i * 4 + 1] = 2 * Math.random() - 1;// y position
// }
//
// // create a regl framebuffer holding the initial particle state
// function createInitialParticleBuffer(initialParticleState) {
// 	// create a texture where R holds particle X and G holds particle Y position
// 	const initialTexture = r.texture({
// 		data: initialParticleState,
// 		shape: [sqrtNumParticles, sqrtNumParticles, 4],
// 		type: 'float'
// 	});
//
// 	// create a frame buffer using the state as the colored texture
// 	return r.framebuffer({
// 		color: initialTexture,
// 		depth: false,
// 		stencil: false,
// 	});
// }
//
// // initialize particle states
// let prevParticleState = createInitialParticleBuffer(initialParticleState);
// let currParticleState = createInitialParticleBuffer(initialParticleState);
// let nextParticleState = createInitialParticleBuffer(initialParticleState);
//
// // cycle which buffer is being pointed to by the state variables
// function cycleParticleStates() {
// 	const tmp = prevParticleState;
// 	prevParticleState = currParticleState;
// 	currParticleState = nextParticleState;
// 	nextParticleState = tmp;
// }
//
//
// // create array of indices into the particle texture for each particle
// const particleTextureIndex = [];
// for (let i = 0; i < sqrtNumParticles; i++) {
// 	for (let j = 0; j < sqrtNumParticles; j++) {
// 		particleTextureIndex.push(i / sqrtNumParticles, j / sqrtNumParticles);
// 	}
// }
//
// // regl command that updates particles state based on previous two
// const updateParticles = r({
// 	// write to a framebuffer instead of to the screen
// 	framebuffer: () => nextParticleState,
// 	// ^^^^^ important stuff.  ------------------------------------------
//
// 	vert: `
//   // set the precision of floating point numbers
//   precision mediump float;
//
//   // vertex of the triangle
//   attribute vec2 position;
//
//   // index into the texture state
//   varying vec2 particleTextureIndex;
//
//   void main() {
//     // map bottom left -1,-1 (normalized device coords) to 0,0 (particle texture index)
//     // and 1,1 (ndc) to 1,1 (texture)
//     particleTextureIndex = 0.5 * (1.0 + position);
//
//     gl_Position = vec4(position, 0, 1);
//   }
//   `,
//
// 	frag: `
// 	// set the precision of floating point numbers
//   precision mediump float;
//
//   // states to read from to get velocity
// 	uniform sampler2D currParticleState;
// 	uniform sampler2D prevParticleState;
//
//   // index into the texture state
//   varying vec2 particleTextureIndex;
//
//   // seemingly standard 1-liner random function
//   // http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
//   float rand(vec2 co){
// 	  return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
// 	}
//
//   void main() {
// 		vec2 currPosition = texture2D(currParticleState, particleTextureIndex).xy;
// 		vec2 prevPosition = texture2D(prevParticleState, particleTextureIndex).xy;
//
// 		vec2 velocity = currPosition - prevPosition;
// 		vec2 random = 0.5 - vec2(rand(currPosition), rand(10.0 * currPosition));
//
// 		vec2 position = currPosition + (0.95 * velocity) + (0.0005 * random);
//
// 		// we store the new position as the color in this frame buffer
//   	gl_FragColor = vec4(position, 0, 1);
//   }
// 	`,
//
// 	attributes: {
// 		// a triangle big enough to fill the screen
// 		position: [
// 			-4, 0,
// 			4, 4,
// 			4, -4
// 		]
// 	},
//
// 	// pass in previous states to work from
// 	uniforms: {
// 		// must use a function so it gets updated each call
// 		currParticleState: () => currParticleState,
// 		prevParticleState: () => prevParticleState,
// 	},
//
// 	// it's a triangle - 3 vertices
// 	count: 3,
// });
//
//
// // regl command that draws particles at their current state
// const drawParticles = r({
// 	vert: `
// 	// set the precision of floating point numbers
//   precision mediump float;
//
// 	attribute vec2 particleTextureIndex;
// 	uniform sampler2D particleState;
//
//   // variables to send to the fragment shader
//   varying vec3 fragColor;
//
//   // values that are the same for all vertices
//   uniform float pointWidth;
//
// 	void main() {
// 		// read in position from the state texture
// 		vec2 position = texture2D(particleState, particleTextureIndex).xy;
//
// 		// copy color over to fragment shader
// 		fragColor = vec3(abs(particleTextureIndex), 1.0);
//
// 		// scale to normalized device coordinates
// 		// gl_Position is a special variable that holds the position of a vertex
//     gl_Position = vec4(position, 0.0, 1.0);
//
// 		// update the size of a particles based on the prop pointWidth
// 		gl_PointSize = pointWidth;
// 	}
// 	`,
//
// 	frag: `
//   // set the precision of floating point numbers
//   precision mediump float;
//
//   // this value is populated by the vertex shader
//   varying vec3 fragColor;
//
//   void main() {
//     // gl_FragColor is a special variable that holds the color of a pixel
//     gl_FragColor = vec4(fragColor, 1);
//   }
//   `,
//
// 	attributes: {
// 		// each of these gets mapped to a single entry for each of the points.
// 		// this means the vertex shader will receive just the relevant value for a given point.
// 		particleTextureIndex,
// 	},
//
// 	uniforms: {
// 		// important to use a function here so it gets the new buffer each render
// 		particleState: () => currParticleState,
// 		pointWidth,
// 	},
//
// 	// specify the number of points to draw
// 	count: numParticles,
//
// 	// specify that each vertex is a point (not part of a mesh)
// 	primitive: 'points',
//
// 	// we don't care about depth computations
// 	depth: {
// 		enable: false,
// 		mask: false,
// 	},
// });
//
// // start the animation loop
// const frameLoop = r.frame(({ tick }) => {
// 	// clear the buffer
// 	r.clear({
// 		// background color (black)
// 		color: [0, 0, 0, 1],
// 		depth: 1,
// 	});
//
// 	// draw the points using our created regl func
// 	drawParticles();
//
// 	// update position of particles in state buffers
// 	// updateParticles();
//
// 	// update pointers for next, current, and previous particle states
// 	cycleParticleStates();
//
// 	// simple way of stopping the animation after a few ticks
// 	if (tick === animationTickLimit) {
// 		console.log(`Hit tick ${tick}, canceling animation loop`);
//
// 		// cancel this loop
// 		frameLoop.cancel();
// 	}
// });