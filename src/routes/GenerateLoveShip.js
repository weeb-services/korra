'use strict';

const { createCanvas } = require('canvas');

const { Route, Constants: { HTTPCodes } } = require('@weeb_services/wapi-core');
const { canvasify, drawImage, drawImageOrText } = require('../functions');

class Awooo extends Route {
	constructor() {
		super('POST', '/love-ship', ['generate_love_ship']);

		this.objectSize = 256;
	}

	async call(req, res) {
		const canvas = createCanvas(this.objectSize * 3, this.objectSize);

		const image = await canvasify('url+https://cdn.discordapp.com/avatars/185476724627210241/a0c639dfd2a07dbf675e8e611468b5d8.png?size=1024');
		await drawImageOrText({
			on: canvas,
			image,
			box: { x: 0, y: 0, w: this.objectSize, h: this.objectSize },
		});

		await drawImage({
			on: canvas,
			image: req.resCache.get('love-ship/heart-wings.png'),
			box: { x: this.objectSize, y: 0, w: this.objectSize, h: this.objectSize },
		});

		await drawImageOrText({
			on: canvas,
			image,
			box: { x: this.objectSize * 2, y: 0, w: this.objectSize, h: this.objectSize },
		});

		res.set('Content-Type', 'image/png');
		res.status(200);
		canvas.pngStream().pipe(res);
	}
}

module.exports = Awooo;
