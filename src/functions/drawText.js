'use strict';

const tinycolor = require('tinycolor2');

const Util = require('../Util');

const contextify = require('./contextify');

/**
 * Additional info
 *
 * options.font.hs Horizontal separation (pixels between words)
 * options.font.vs Vertical separation (pixels between starts of a line, usually font size)
 */

/**
 * Draws text in a box on a canvas context, excess /\S/ are removed
 *
 * @param {object} options The options
 * @param {string|Buffer|HTMLCanvasElement|CanvasRenderingContext2D} options.on The canvas or context to draw on
 * @param {string=} options.text The text to write
 * @param {{x: number, y: number, w: number, h: number}} options.box The box where the text should be drawn in
 * @param {{family: string, size: number, vs: number, hs: number, color: string|object}=} options.font Font information
 * @param {{x: number, y: number, angle: number}=} options.rotate Text rotation options
 * @param {boolean=} options.stroke Whether to draw the stroke (outlines of each character) or not
 * @param {{x: number, y: number}=} options.offset The offset of the text in the box
 */
// eslint-disable-next-line complexity
async function drawText(options = {}) {
	// Validation
	if (!options.text) {
		options.text = 'weeb.sh';
	}
	Util.validateBox(options.box, 'drawText');
	options.offset = options.offset || {};
	options.offset.x = options.offset.x == null ? 0 : options.offset.x;
	options.offset.y = options.offset.y == null ? 0 : options.offset.y;

	// Load image
	const ctx = await contextify(options.on);

	// Save context state
	ctx.save();

	// Apply font
	if (options.font) {
		if (options.font.color) {
			const color = tinycolor(options.font.color);
			if (!color.isValid()) {
				throw new Error(`drawText: Template font color ${color} isn't valid`);
			}
			ctx.fillStyle = color.toHexString();
		} else {
			ctx.fillStyle = '#000';
		}

		if (options.font.size && options.font.family) {
			ctx.font = `${options.font.size}px ${options.font.family}`;
		}
	} else {
		options.font = {};
	}

	// More validation
	options.font.hs = options.font.hs == null ? ctx.measureText(' ').width : options.font.hs;
	if (options.font.vs == null) {
		const font = ctx.font.match(/^(\d+)px/);
		if (font) {
			options.font.vs = parseInt(font[1], 10);
		} else {
			throw new Error(`drawText: Either options.font.vs has to be defined or ctx.font's size must be in pixels`);
		}
	}

	// Get words
	const regex = /\S+/g;
	const words = [];
	let match = null;
	do {
		match = regex.exec(options.text);
		if (match) {
			words.push(match[0]);
		}
	} while (match);

	// Get word sizes
	const sizes = words.map(e => ctx.measureText(e));

	// Get text width from->to adding horizontal spacing
	const getWidth = (from, to) => sizes.slice(from, to).reduce((a, c) => a + c.width + options.font.hs, 0);

	const lines = [];
	// Current word
	let current = 0;
	// While we still have words left
	while (current < words.length) {
		if ((lines.length + 1) * options.font.vs > options.box.h) {
			// Prevent up and down bleeding, could be put as an option
			break;
		}

		// Width and size of the current line
		let width;
		let size = 1;
		while (current + size <= words.length) {
			width = getWidth(current, current + size);
			if (width > options.box.w) {
				// If not first word in line, reduce size and recalc width
				if (size > 1) {
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

	// Rotate if wanted
	if (options.rotate) {
		ctx.translate(options.rotate.x, options.rotate.y);
		ctx.rotate(options.rotate.angle * Math.PI / 180);
		ctx.translate(-options.rotate.x, -options.rotate.y);
	}

	// Draw text for every line
	lines.forEach((line, lindex) => {
		// Cumulative X offset for drawing words and spacing them
		let xoffset = 0;
		line.words.forEach((word, windex) => {
			ctx.fillText(
				word,
				options.box.x + ((options.box.w - line.width) / 2) + xoffset + options.offset.x,
				options.box.y + ((options.box.h - (lines.length * options.font.vs)) / 2) + (lindex * options.font.vs) + options.offset.y,
			);
			if (options.stroke) {
				ctx.strokeText(
					word,
					options.box.x + ((options.box.w - line.width) / 2) + xoffset + options.offset.x,
					options.box.y + ((options.box.h - (lines.length * options.font.vs)) / 2) + (lindex * options.font.vs) + options.offset.y,
				);
			}

			// Add the current word's width and horizontal spacing
			xoffset += line.sizes[windex].width + options.font.hs;
		});
	});

	// Restore context state
	ctx.restore();

	// Return canvas
	return ctx.canvas;
}

module.exports = drawText;
