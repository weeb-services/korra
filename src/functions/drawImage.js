'use strict';

const Util = require('../Util');

const canvasify = require('./canvasify');
const contextify = require('./contextify');

const Modes = ['fit', 'fill'];

/**
 * Draws an image onto another one
 *
 * @param {object} options The options
 * @param {string|Buffer|HTMLCanvasElement|CanvasRenderingContext2D} options.on The canvas to draw on
 * @param {string|Buffer|HTMLCanvasElement|CanvasRenderingContext2D} options.image The image that should be drawn
 * @param {{x: number, y: number, w: number, h: number}} options.box The box where the image should be drawn
 * @param {{x: number, y: number, angle: number}=} options.rotate The rotation of the image that should be drawn
 * @param {'fit'|'fill'} options.mode The mode for drawing the image
 */
async function drawImage(options = {}) {
	// Validation
	Util.validateBox(options.box, 'drawImage');
	if (options.rotate) {
		Util.validateRotate(options.rotate, 'drawImage');
	}
	options.mode = options.mode || 'fill';
	if (!Modes.includes(options.mode)) {
		throw new Error('drawImage: Invalid mode');
	}

	// Load images
	const ctx = await contextify(options.on);
	const image = await canvasify(options.image);

	// Save current context
	ctx.save();

	// Rotate if wanted
	if (options.rotate) {
		ctx.translate(options.rotate.x, options.rotate.y);
		ctx.rotate(options.rotate.angle * Math.PI / 180);
		ctx.translate(-options.rotate.x, -options.rotate.y);
	}

	// Drawing position calculation magic
	let w = image.width;
	let h = image.height;
	const rh = options.box.h / h;
	const rw = options.box.w / w;
	const scale = options.mode === 'fill' ? Math.max(rh, rw) : Math.min(rh, rw);
	w *= scale;
	h *= scale;

	// Drawing the image
	ctx.drawImage(image, options.box.x + ((options.box.w - w) / 2), options.box.y + ((options.box.h - h) / 2), w, h);

	// Restoring previous state
	ctx.restore();

	// Return the canvas
	return ctx.canvas;
}

drawImage.Modes = Modes;

module.exports = drawImage;
