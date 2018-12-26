uniform float time;
attribute vec2 position;
attribute vec2 speed;

void main() {
	gl_PointSize = 3.0;
	gl_Position = vec4(
		mod(position.x + (speed.x * time), 1.0),
		mod(position.y + (speed.y * time), 1.0),
		0,
		1
	);
}