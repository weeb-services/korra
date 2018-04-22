'use strict';

const tinycolor = require('tinycolor2');

const { HTTPCodes } = require('@weeb_services/wapi-core').Constants;

const colorize = require('../functions/colorize');
const canvasify = require('../functions/canvasify');

async function awooo(query, res) {
	const hair = query.hair ? tinycolor(query.hair) : null;
	if (hair && !hair.isValid()) {
		return res.status(HTTPCodes.BAD_REQUEST).json({
			status: HTTPCodes.BAD_REQUEST,
			message: 'Invalid hair color',
		});
	}

	const face = query.face ? tinycolor(query.face) : null;
	if (face && !face.isValid()) {
		return res.status(HTTPCodes.BAD_REQUEST).json({
			status: HTTPCodes.BAD_REQUEST,
			message: 'Invalid face color',
		});
	}

	const mode = query.mode ? query.mode : 'hsl-color';
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
	return res.status(200).send(canvas.toBuffer());
}

module.exports = awooo;
