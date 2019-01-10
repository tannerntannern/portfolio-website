// This dummy value will be replaced by the JS
#define NUM_POINTS 100

uniform sampler2D pointTexture;
uniform float pointTextureXCoords[NUM_POINTS];
uniform float pointTextureYCoords[NUM_POINTS];
uniform float canvasWidth;
uniform float fullCanvasWidth;

attribute float index;

varying vec2 frag_VertCoord;

void main() {
	gl_PointSize = 5.0;

	int i = int(index);
	vec2 uv = vec2(pointTextureXCoords[i], pointTextureYCoords[i]);
	vec4 point = texture2D(pointTexture, uv).rgba;

	gl_Position = vec4(point.r, point.g, 0.0, 1.0);
	frag_VertCoord = vec2(point.r, point.g);

//	gl_Position = vec4(
//		mod(position.x + (speed.x * time) + size, fullSize) - size,
//		mod(position.y + (speed.y * time) + size, fullSize) - size,
//		0,
//		1
//	);
//	frag_VertCoord = gl_Position.xy;
}