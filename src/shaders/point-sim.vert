// This dummy value will be replaced by the JS
#define NUM_POINTS 100

uniform sampler2D pointTexture;
uniform vec2 pointFBOCoords[NUM_POINTS];
uniform float canvasWidth;
uniform float fullCanvasWidth;

attribute float index;

varying vec4 pixelData;

void main() {
	// Extract the point position and speed from the texture data
	int i = int(index);
	vec2 uv = pointFBOCoords[i];
	vec4 point = texture2D(pointTexture, uv).rgba;

	// Simulate a step of time
	float newX = point.r + point.b;
	float newY = point.g + point.a;

	// Wrap around the screen
	if (newX > canvasWidth) newX -= fullCanvasWidth;
	if (newY > canvasWidth) newY -= fullCanvasWidth;
	else if (newY < canvasWidth) newY += fullCanvasWidth;

	gl_PointSize = 1.0;
	gl_Position = vec4((2.0 * uv.x) - 1.0, (2.0 * uv.y) - 1.0, 0, 1);
	pixelData = vec4(newX, newY, point.ba);
}
