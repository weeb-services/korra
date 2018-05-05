'use strict';

const { createCanvas } = require('canvas');
const tinycolor = require('tinycolor2');
const canvasify = require('./canvasify');

const Modes = ['hsl-color', 'darken', 'lighten', 'hard-light', 'soft-light', 'hsl-hue', 'hsl-saturation', 'hsl-luminosity'];

async function colorize(options) {
	let canvas = await canvasify(options.source);

	if (options.color) { // If a color exists, colorize, if not just skip to use as normal layer
		const color = tinycolor(options.color);
		if (!color.isValid()) {
			throw new Error(`Invalid color: ${color}`);
		}
		const mode = options.mode || 'hsl-color';
		const ctx = canvas.getContext('2d');

		if (Modes.includes(mode)) {
			// Begin Alpha-Channel Hack
			const innerCanvas = createCanvas(canvas.width, canvas.height);
			const innerCtx = innerCanvas.getContext('2d');

			innerCtx.fillStyle = color.toRgbString();
			innerCtx.fillRect(0, 0, canvas.width, canvas.height);
			innerCtx.globalCompositeOperation = 'destination-in';
			innerCtx.drawImage(canvas, 0, 0);
			// End Alpha-Channel Hack

			ctx.save();
			ctx.globalCompositeOperation = mode;
			ctx.drawImage(innerCanvas, 0, 0);
			ctx.restore();
		} else {
			throw new Error(`Invalid mode: ${mode}`);
		}
	}

	if (options.on) {
		const onCanvas = await canvasify(options.on);
		const onCtx = onCanvas.getContext('2d');
		onCtx.drawImage(canvas, 0, 0);
		canvas = onCanvas;
	}

	return canvas;
}

colorize.Modes = Modes;

module.exports = colorize;
