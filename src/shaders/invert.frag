precision mediump float;

uniform float xDivide;
uniform vec3 color1;
uniform vec3 color2;

varying vec2 frag_VertCoord;

void main() {
	if (frag_VertCoord.x < xDivide)
		gl_FragColor = vec4(color1, 1);
	else
		gl_FragColor = vec4(color2, 1);
}