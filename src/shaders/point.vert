uniform float time;
uniform float size;
uniform float fullSize;

attribute vec2 position;
attribute vec2 speed;

varying vec2 frag_VertCoord;

void main() {
	gl_PointSize = 3.0;
	gl_Position = vec4(
		mod(position.x + (speed.x * time) + size, fullSize) - size,
		mod(position.y + (speed.y * time) + size, fullSize) - size,
		0,
		1
	);
	frag_VertCoord = gl_Position.xy;
}