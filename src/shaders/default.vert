attribute vec2 position;

varying vec2 frag_VertCoord;

void main() {
	gl_Position = vec4(position, 0, 1);
	frag_VertCoord = gl_Position.xy;
}