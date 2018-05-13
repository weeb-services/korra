'use strict';

const contextify = require('./contextify');
const drawText = require('./drawText');
const drawImage = require('./drawImage');

async function drawImageOrText(options = {}) {
	const ctx = await contextify(options.on);

	if (options.image) {
		// Draw the image
		await drawImage({
			on: ctx,
			image: options.image,
			box: options.boxImage || options.box,
			mode: options.mode,
			rotate: options.rotate,
		});
	} else {
		// Draw the text
		await drawText({
			on: ctx,
			text: options.text,
			box: options.boxText || options.box,
			font: options.font,
			offset: {
				y: options.font.size,
			},
			rotate: options.rotate,
		});
	}

	return ctx.canvas;
}

module.exports = drawImageOrText;
