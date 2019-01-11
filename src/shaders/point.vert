// This dummy value will be replaced by the JS
#define NUM_POINTS 100

uniform sampler2D pointTexture;
uniform vec2 pointFBOCoords[NUM_POINTS];

attribute float index;

varying vec2 frag_VertCoord;

void main() {
	gl_PointSize = 5.0;

	int i = int(index);
	vec2 uv = pointFBOCoords[i];
	vec4 point = texture2D(pointTexture, uv).rgba;

	gl_Position = vec4(point.rg, 0.0, 1.0);
	frag_VertCoord = vec2(point.r, point.g);
}