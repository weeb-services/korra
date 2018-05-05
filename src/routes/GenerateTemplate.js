'use strict';

const { Route, Constants: { HTTPCodes } } = require('@weeb_services/wapi-core');
const { canvasify, compose } = require('../functions');

class Template extends Route {
	constructor() {
		super('GET', '/template/:name', ['generate_simple']);
	}

	async call(req, res, alias) {
		const template = this.getTemplate(req);
		if (!template) {
			return {
				status: HTTPCodes.BAD_REQUEST,
				message: 'Invalid template',
			};
		}

		const image = req.query.image ? await canvasify(`url+${req.query.image}`) : null;

		const canvas = await compose(this.getTemplate(req, alias), {
			text: req.query.text,
			image,
			mode: req.query.mode,
		});

		res.set('Content-Type', 'image/png');
		res.status(200);
		canvas.pngStream().pipe(res);
	}

	getTemplate(req) {
		switch (req.params.name) {
			case 'blu-neko':
				return {
					image: req.resCache.get('template/blu-neko.png'),
					boxImage: { x: 180, y: 488, w: 414, h: 307 },
					boxText: { x: 195, y: 506, w: 390, h: 281 },
					font: { family: 'Anisa', size: 56, hs: 10 },
					bgColor: '#fff',
				};
			case 'hibiki':
				return {
					image: req.resCache.get('template/hibiki.png'),
					rotate: { x: 40.00, y: 300.00, angle: -20.00 },
					boxImage: { x: 36, y: 290, w: 490, h: 350 },
					boxText: { x: 46, y: 308, w: 468, h: 318 },
					font: { family: 'Anisa', size: 56, hs: 10 },
					bgColor: '#fff',
				};
			case 'pink':
				return {
					image: req.resCache.get('template/pink.png'),
					rotate: { x: 488.00, y: 133.00, angle: -10.27 },
					boxImage: { x: 485, y: 129, w: 663, h: 431 },
					boxText: { x: 497, y: 193, w: 635, h: 304 },
					font: { family: 'Anisa', size: 100, hs: 10 },
					bgColor: '#fff',
					mask: req.resCache.get('template/pink_mask.png'),
				};
			case 'shy':
				return {
					image: req.resCache.get('template/shy.png'),
					rotate: { x: 369.00, y: 441.00, angle: 3.16 },
					boxImage: { x: 358, y: 432, w: 458, h: 427 },
					boxText: { x: 376, y: 454, w: 420, h: 391 },
					font: { family: 'Anisa', size: 56, hs: 10 },
					bgColor: '#fff',
				};
			case 'the-search':
				return {
					image: req.resCache.get('template/the-search.png'),
					boxText: { x: 58, y: 346 - 18, w: 170, h: 18 * 4 },
					boxImage: { x: 52, y: 326, w: 175, h: 81 },
					font: { family: 'Dilbert', size: 18, hs: 5, vs: 18 },
					bgColor: '#fff',
				};
			case 'waifu-insult':
				// TODO This has not been adjusted yet
				return {
					image: req.resCache.get('template/waifu-insult.png'),
					rotate: { x: 40.00, y: 300.00, angle: -20.00 },
					boxImage: { x: 36, y: 290, w: 490, h: 350 },
					boxText: { x: 46, y: 308, w: 468, h: 318 },
					font: { family: 'Anisa', size: 56, hs: 10 },
					bgColor: '#fff',
				};
			default:
				return null;
		}
	}
}

module.exports = Template;