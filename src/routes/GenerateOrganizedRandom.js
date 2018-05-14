'use strict';

const { Route, Constants: { HTTPCodes } } = require('@weeb_services/wapi-core');
const { canvasify, organizedRandom } = require('../functions');

class OrganizedRandom extends Route {
	constructor() {
		super('GET', '/random/:name', ['generate_random']);
	}

	async call(req, res) {
		const config = this.getConfig(req);
		if (!config) {
			return {
				status: HTTPCodes.BAD_REQUEST,
				message: 'Invalid config',
			};
		}

		let canvas = await canvasify(config.base);
		try {
			for (let i = 0; i < config.elements.length; i++) {
				// eslint-disable-next-line
				canvas = await organizedRandom(canvas, config.elements[i], req.query.original === 'true');
			}
		} catch (e) {
			return {
				status: HTTPCodes.BAD_REQUEST,
				message: `${e.message}`,
			};
		}

		res.set('Content-Type', 'image/png');
		res.status(200);
		canvas.pngStream().pipe(res);
	}

	getConfig(req) {
		switch (req.params.name) {
			case 'eyes':
				return {
					base: req.resCache.get('random/eyes_back.png'),
					elements: [
						{
							source: req.resCache.get('random/eyes_pupil.png'),
							originalPosition: { x: 20, y: 110 },
							randomCircle: {
								x: 55,
								y: 70,
								range: { max: 55 },
								scaleY: 1.17,
							},
						},
						{
							source: req.resCache.get('random/eyes_pupil.png'),
							originalPosition: { x: 210, y: 110 },
							randomCircle: {
								x: 245,
								y: 70,
								range: { max: 55 },
								scaleY: 1.17,
							},
						},
					],
				};
			case 'won':
				return {
					base: req.resCache.get('random/wan_back.png'),
					elements: [
						{
							source: req.resCache.get('random/wan_mouth.png'),
							originalPosition: { x: 399, y: 610 },
							randomCircle: {
								x: 399,
								y: 610,
								range: { max: 100 },
							},
						},
						{
							source: req.resCache.get('random/wan_eye_right.png'),
							originalPosition: { x: 562, y: 433 },
							randomCircle: {
								x: 562,
								y: 433,
								range: { max: 100 },
							},
						},
						{
							source: req.resCache.get('random/wan_eye_left.png'),
							originalPosition: { x: 295, y: 460 },
							randomCircle: {
								x: 295,
								y: 460,
								range: { max: 100 },
							},
						},
					],
				};
			default:
				return null;
		}
	}
}

module.exports = OrganizedRandom;
