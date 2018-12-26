uniform float time;
attribute vec2 position;
attribute vec2 speed;

void main() {
	gl_Position = vec4(
		position.x + (speed.x * time),
		position.y + (speed.y * time),
		0,
		1
	);
}