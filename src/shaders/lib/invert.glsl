vec4 getColor(vec3 color1, vec3 color2, float xDivide, vec2 position) {
	if (position.x < xDivide)
		return vec4(color1, 1);
	else
		return vec4(color2, 1);
}

#pragma glslify: export(getColor)
