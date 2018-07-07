'use strict';

const { Route, Constants: { HTTPCodes } } = require('@weeb_services/wapi-core');
const { canvasify, colorize, ColorizeMode, parseColor, ColorizeModes } = require('@weeb_services/gfn');

class Awooo extends Route {
	constructor() {
		super('GET', '/awooo', ['generate_simple']);
	}

	async call(req, res) {
		const hair = req.query.hair ? parseColor(req.query.hair) : null;
		if (hair && !hair.isValid()) {
			res.status(HTTPCodes.BAD_REQUEST).json({
				status: HTTPCodes.BAD_REQUEST,
				message: 'Invalid hair color',
			});
			return;
		}

		const face = req.query.face ? parseColor(req.query.face) : null;
		if (face && !face.isValid()) {
			res.status(HTTPCodes.BAD_REQUEST).json({
				status: HTTPCodes.BAD_REQUEST,
				message: 'Invalid face color',
			});
			return;
		}

		const mode = req.query.mode ? req.query.mode : ColorizeMode.HSL_COLOR;
		if (!ColorizeModes.includes(mode)) {
			res.status(HTTPCodes.BAD_REQUEST).json({
				status: HTTPCodes.BAD_REQUEST,
				message: 'Invalid mode',
				validModes: ColorizeModes,
			});
			return;
		}

		const canvas = await canvasify(req.resCache.get('awooo/base.png'));

		await colorize({
			on: canvas,
			source: req.resCache.get('awooo/hair.png'),
			color: hair,
			mode,
		});

		await colorize({
			on: canvas,
			source: req.resCache.get('awooo/face.png'),
			color: face,
			mode,
		});

		res.set('Content-Type', 'image/png');
		res.status(200);
		canvas.pngStream().pipe(res);
	}
}

module.exports = Awooo;
