'use strict';

const helper = require('../helper');

/**
 * @description Draws text in a box on a canvas context, excess /\S/ are removed
 * @param {CanvasRenderingContext2D} ctx Canvas context to draw on
 * @param {string} text Text to write
 * @param {Object} box {x, y, w, h}
 * @param {number} hs Horizontal separation (pixels between words)
 * @param {number} vs Vertical separation (pixels between starts of a line, usually font size)
 * @param {Object} options {stroke: false, hs: space size, vs: line height}
 */
function drawText(ctx, text, box, options) {
	// Maybe ctx = ctx.getContext('2d) if instanceof Canvas passed ?
	options = options || {};

	options.hs = helper.def(options.hs, ctx.measureText(' ').width); // Default hs to a single space witdh
	if (options.vs === undefined) {
		const font = ctx.font.match(/^(\d+)px/);
		if (font) {
			options.vs = parseInt(font[1], 10);
		} else {
			throw new Error(`Either options.vs has to be defined or ctx.font's size must be in pixels`);
		}
	}
	options.offsetX = helper.def(options.offsetX, 0);
	options.offsetY = helper.def(options.offsetY, 0);

	const words = helper.findAll(text, /\S+/).map(e => e[0]); // Split the words
	const sizes = words.map(e => ctx.measureText(e)); // Get the words sizes
	const lines = [];

	const getWidth = (from, to) => sizes.slice(from, to).reduce((a, c) => a + c.width + options.hs, 0); // Get text width from->to adding horizontal spacing

	let current = 0; // Current word
	while (current < words.length) { // While we still have words left
		if ((lines.length + 1) * options.vs > box.h) break; // Prevent up and down bleeding, could be put as an option
		let width;
		let size = 1; // Width and size of the current line
		while (current + size <= words.length) {
			width = getWidth(current, current + size);
			if (width > box.w) {
				if (size > 1) { // If not first word in line, reduce size and recalc width
					size--;
					width = getWidth(current, current + size);
				}
				break;
			}
			size++;
		}
		lines.push({ width: width, sizes: sizes.slice(current, current + size), words: words.slice(current, current + size) });
		current += size;
	}

	lines.forEach((line, lindex) => {
		let xoffset = 0; // Cumulative X offset for drawing words and spacing them
		line.words.forEach((word, windex) => {
			ctx.fillText(
				word,
				box.x + ((box.w - line.width) / 2) + xoffset + options.offsetX,
				box.y + ((box.h - (lines.length * options.vs)) / 2) + (lindex * options.vs) + options.offsetY);
			if (options.stroke) {
				ctx.strokeText(
					word,
					box.x + ((box.w - line.width) / 2) + xoffset + options.offsetX,
					box.y + ((box.h - (lines.length * options.vs)) / 2) + (lindex * options.vs) + options.offsetY);
			}
			xoffset += line.sizes[windex].width + options.hs; // Add the current word's width and horizontal spacing
		});
	});
	// Maybe return the ctx or ctx.canvas for chaining ?
}

module.exports = drawText;
