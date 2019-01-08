#version 300 es
// TODO: need to make a 1.0-compatible version of this

precision mediump float;

#pragma glslify: getColor = require(./lib/invert.glsl);

uniform float xDivide;
uniform vec3 color1;
uniform vec3 color2;

in vec2 frag_VertCoord;
out vec4 fragmentColor;

void main() {
	// https://www.desultoryquest.com/blog/drawing-anti-aliased-circular-points-using-opengl-slash-webgl/
	float r = 0.0, delta = 0.0, alpha = 1.0;
	vec2 cxy = 2.0 * gl_PointCoord - 1.0;
	r = dot(cxy, cxy);
	if (r > 1.0) {
		discard;
	}

	fragmentColor = getColor(color1, color2, xDivide, frag_VertCoord);
}