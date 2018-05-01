'use strict';

const Modes = ['fit', 'fill'];

/**
 * @description
 * @param {CanvasRenderingContext2D} ctx Canvas context to draw on
 * @param {Image} image Image to scale
 * @param {Array} box {x, y, w, h}
 * @param {Array} options {mode: 'fit' or 'fill'}
 */
function drawImage(ctx, image, box, options) {
	options = options || {};
	const mode = Modes.includes(options.mode) ? options.mode : 'fit';
	let w = image.width;
	let h = image.height;
	const rh = box.h / h;
	const rw = box.w / w;

	const scale = mode === 'fill' ? Math.max(rh, rw) : Math.min(rh, rw);
	w *= scale;
	h *= scale;

	ctx.drawImage(image, box.x + ((box.w - w) / 2), box.y + ((box.h - h) / 2), w, h);
}

drawImage.Modes = Modes;

module.exports = drawImage;
