precision mediump float;

#pragma glslify: getColor = require(./lib/invert.glsl);

uniform float xDivide;
uniform vec3 color1;
uniform vec3 color2;

varying vec2 frag_VertCoord;

void main() {
	gl_FragColor = getColor(color1, color2, xDivide, frag_VertCoord);
}