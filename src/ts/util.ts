/**
 * Debounce function taken from Underscore.js
 *
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @returns {() => void}
 */
export function debounce(func: Function, wait: number, immediate?: boolean) {
	let timeout;
	return function() {
		let context = this, args = arguments;
		let later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

/**
 * Returns a random number between the given min and max.
 */
export function randomRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

/**
 * Converts the given hex color into an array of color components.
 */
export function hexToVec(hexString: string): [number, number, number] {
	// Separate the individual components
	var components = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/.exec(hexString).slice(1, 4);

	// Convert each component to a decimal
	return <[number, number, number]> components.map(function(comp) {
		return parseInt(comp, 16) / 255;
	});
}

/**
 * REGL doesn't like uniforms that look like `uniformName: ['val1', 'val2', ...]`, so instead we have to convert it to
 * a stupid-ass format.
 */
export function reglUniformArray(name: string, data: any[]): {[key: string]: any} {
	let result = {};
	for (let i = 0; i < data.length; i ++) {
		result[`${name}[${i}]`] = data[i];
	}
	return result;
}

/**
 * Given a number, returns a power of two that is equal or greater to the given number.
 */
export function nearestUpperPowerOf2(n: number): number {
	let nearest = 1 << 31 - Math.clz32(n);
	if (n > nearest) nearest = nearest << 1;
	return nearest;
}

/**
 * Converts a WebGL Texture to a data uri image for testing purposes.
 */
export function createImageFromTexture(gl, tex) {
	let width = tex._texture.width,
		height = tex._texture.height,
		texture = tex._texture.texture;

	// Create a framebuffer backed by the texture
	let framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	// Read the contents of the framebuffer
	let data = new Float32Array(width * height * 4);
	gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, data); // TODO: this may not work quite right anymore now that half-floats are used
	gl.deleteFramebuffer(framebuffer);

	// Convert the data from floats to ints
	let intData = Uint8Array.from(data, (v, k) => 255 * v);

	// Create a 2D canvas to store the result
	let canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	let context = canvas.getContext('2d');

	// Copy the pixels to a 2D canvas
	let imageData = context.createImageData(width, height);
	imageData.data.set(intData);
	context.putImageData(imageData, 0, 0);

	return canvas.toDataURL();
}

/**
 * Distance approximation function, based on octagons.
 *
 * https://gist.github.com/aurbano/4693462
 */
export function distApprox(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
	let x = p2.x - p1.x,
		y = p2.y - p1.y;
	return 1.426776695*Math.min(0.7071067812*(Math.abs(x)+Math.abs(y)), Math.max (Math.abs(x), Math.abs(y)));
}

/**
 * Distance approximation function, based on squares (Manhattan distance).
 *
 * For the purposes of determining a minor graphical quality, this is plenty fine.
 */
export function distApprox2(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
	return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
}