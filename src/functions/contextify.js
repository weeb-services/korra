'use strict';

const canvasify = require('./canvasify');

const { Canvas, CanvasRenderingContext2D } = require('canvas');

async function contextify(input) {
	if (input instanceof CanvasRenderingContext2D) {
		return input;
	}
	if (input instanceof Canvas) {
		return input.getContext('2d');
	}
	if (typeof input === 'string' || typeof input === Buffer) {
		return (await canvasify(input)).getContext('2d');
	}

	throw new Error(`contextify: Input parameter invalid`);
}

module.exports = contextify;
