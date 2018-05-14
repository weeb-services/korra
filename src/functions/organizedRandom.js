'use strict';

const canvasify = require('./canvasify');

function getRandomArbitrary(min, max) {
	return (Math.random() * (max - min)) + min;
}

/*
	Config template for later reference when writing JSDoc
	{
		source: 'PATH',
		originalPosition: {x: 0, y: 0},
		randomCircle: {
			x: 0,
			y: 0,
			range: {[min: 0], max: 0},
			[scaleX: 1],
			[scaleY: 1],
		}
	}
*/

/**
 * Puts an element on an image or canvas in a controlled random manner
 * I'll do full JSDoc later
 */
async function organizedRandom(on, config, original) {
	const canvas = await canvasify(config.source);
	const onCanvas = await canvasify(on);
	const onCtx = onCanvas.getContext('2d');

	// If original image is requested and original position provided
	if (original && config.originalPosition) {
		onCtx.drawImage(canvas, config.originalPosition.x, config.originalPosition.y);
		return onCanvas;
	}

	// Random placement in an elipse
	if (config.randomCircle) {
		const distance = getRandomArbitrary(config.randomCircle.range.min || 0, config.randomCircle.range.max);
		const angle = getRandomArbitrary(0, 2 * Math.PI);

		const scaleX = isNaN(config.randomCircle.scaleX) ? 1 : config.randomCircle.scaleX;
		const scaleY = isNaN(config.randomCircle.scaleY) ? 1 : config.randomCircle.scaleY;

		const x = (distance * Math.cos(angle) * scaleX) + config.randomCircle.x;
		const y = (distance * Math.sin(angle) * scaleY) + config.randomCircle.y;

		onCtx.drawImage(canvas, x, y);
	}

	return onCanvas;
}

module.exports = organizedRandom;
