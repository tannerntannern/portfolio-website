precision mediump float;

#pragma glslify: getColor = require(./lib/invert.glsl);

uniform float xDivide;
uniform vec3 color1;
uniform vec3 color2;

varying vec2 frag_VertCoord;

void main() {
	// https://www.desultoryquest.com/blog/drawing-anti-aliased-circular-points-using-opengl-slash-webgl/
	float r = 0.0, delta = 0.0, alpha = 1.0;
	vec2 cxy = 2.0 * gl_PointCoord - 1.0;
	r = dot(cxy, cxy);
	if (r > 1.0) {
		discard;
	}

	gl_FragColor = getColor(color1, color2, xDivide, frag_VertCoord);
}