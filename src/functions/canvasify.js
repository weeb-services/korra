'use strict';

const fs = require('fs');
const util = require('util');
const { createCanvas, Image, Canvas } = require('canvas');

const asyncReadFile = util.promisify(fs.readFile);

async function canvasify(input) {
	if (input instanceof Canvas) return input;

	if (typeof input === 'string') {
		const image = new Image();
		try {
			image.src = await asyncReadFile(input);
		} catch (e) {
			throw new Error(`canvasify: Failed to load file '${input}': ${e.message}`);
		}

		const canvas = createCanvas(image.width, image.height);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0);

		return canvas;
	}

	throw new Error(`canvasify: Input parameter invalid: ${input}`);
}

module.exports = canvasify;
