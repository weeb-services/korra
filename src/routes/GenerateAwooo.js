'use strict';

const tinycolor = require('tinycolor2');

const { Route, Constants: { HTTPCodes } } = require('../core');
const { canvasify, colorize } = require('../functions');

class Awooo extends Route {
	constructor() {
		super('GET', '/awooo', ['generate_simple']);
	}

	async call(req, res) {
		const hair = req.query.hair ? tinycolor(req.query.hair) : null;
		if (hair && !hair.isValid()) {
			return res.status(HTTPCodes.BAD_REQUEST).json({
				status: HTTPCodes.BAD_REQUEST,
				message: 'Invalid hair color',
			});
		}

		const face = req.query.face ? tinycolor(req.query.face) : null;
		if (face && !face.isValid()) {
			return res.status(HTTPCodes.BAD_REQUEST).json({
				status: HTTPCodes.BAD_REQUEST,
				message: 'Invalid face color',
			});
		}

		const mode = req.query.mode ? req.query.mode : 'hsl-color';
		if (!colorize.Modes.includes(mode)) {
			return res.status(HTTPCodes.BAD_REQUEST).json({
				status: HTTPCodes.BAD_REQUEST,
				message: 'Invalid mode',
				validModes: colorize.Modes,
			});
		}

		const canvas = await canvasify('resources/awooo/base.png');

		await colorize({
			on: canvas,
			source: 'resources/awooo/hair.png',
			color: hair,
			mode,
		});

		await colorize({
			on: canvas,
			source: 'resources/awooo/face.png',
			color: face,
			mode,
		});

		res.set('Content-Type', 'image/png');
		res.status(200).send(canvas.toBuffer());
	}
}

module.exports = Awooo;
