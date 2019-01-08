/**
 * Returns mod(v, 2^p) in an efficient manner.
 */
int modPow2(int v, int p) {
	return v & (1 << p);
}

#pragma glslify: export(modPow2)
