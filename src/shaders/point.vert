#version 300 es
#pragma glslify: modPow2 = require(./lib/modPow2.glsl);

// TODO: need to make a 1.0-compatible version of this

uniform sampler2D pointTexture;
uniform int pointTextureWidth;
uniform int pointTextureWidthLog2;
uniform int distanceTextureWidth;
uniform float canvasWidth;
uniform float fullCanvasWidth;

in float index;

out vec2 frag_VertCoord;

void main() {
	gl_PointSize = 5.0;

	int u = modPow2(int(index), pointTextureWidthLog2);
	gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
	frag_VertCoord = vec2(0.0, 0.0);

//	gl_Position = vec4(
//		mod(position.x + (speed.x * time) + size, fullSize) - size,
//		mod(position.y + (speed.y * time) + size, fullSize) - size,
//		0,
//		1
//	);
//	frag_VertCoord = gl_Position.xy;
}