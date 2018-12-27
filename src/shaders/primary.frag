precision mediump float;

uniform float xDivide;
uniform vec3 colorPrimary;
uniform vec3 colorAccent;

varying vec2 frag_VertCoord;

void main() {
	if (frag_VertCoord.x > xDivide)
		gl_FragColor = vec4(colorPrimary, 1);
	else
		gl_FragColor = vec4(colorAccent, 1);
}