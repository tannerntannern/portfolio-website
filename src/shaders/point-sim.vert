// This dummy value will be replaced by the JS
#define NUM_POINTS 100

uniform sampler2D pointTexture;
uniform float pointTextureXCoords[NUM_POINTS];
uniform float pointTextureYCoords[NUM_POINTS];
uniform float canvasWidth;
uniform float fullCanvasWidth;

attribute float index;

varying vec4 pixelData;

void main() {
	// Extract the point position and speed from the texture data
	int i = int(index);
	vec2 uv = vec2(pointTextureXCoords[i], pointTextureYCoords[i]);
	vec4 point = texture2D(pointTexture, uv).rgba;

	// Simulate a step of time
	float newX = /*point.r + point.b*/ 0.0;
	float newY = /*point.g + point.a*/ 0.0;

	// Wrap around the screen
	if (newX > canvasWidth) newX -= fullCanvasWidth;
	if (newY > canvasWidth) newY -= fullCanvasWidth;
	else if (newY < canvasWidth) newY += fullCanvasWidth;

	gl_Position = vec4((2.0 * uv.x) - 1.0, -2.0 * uv.y, 0, 1);
	pixelData = vec4(newX, newY, point.ba);
}
