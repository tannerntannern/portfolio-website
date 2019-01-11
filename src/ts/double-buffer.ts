import {Framebuffer2D, Regl, Texture2DOptions} from 'regl';

class DoubleFBO {
	public current: Framebuffer2D;
	public next: Framebuffer2D;

	constructor(r: Regl, textureOptions: Texture2DOptions) {
		this.current = r.framebuffer({
			color: r.texture(textureOptions),
			depth: false,
			stencil: false
		});

		this.next = r.framebuffer({
			color: r.texture(textureOptions),
			depth: false,
			stencil: false
		});
	}

	public swap() {
		let temp = this.current;
		this.current = this.next;
		this.next = temp;
	}
}

export {
	DoubleFBO
};