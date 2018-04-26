const { registerFont } = require('canvas');

const path = 'resources/simple-template/';

registerFont(`${path}DILBERTFONT2.ttf`, { family: 'Dilbert' });
registerFont(`${path}AnisaSans.ttf`, { family: 'Anisa' });

module.exports = {
	search: {
		base: `${path}the-search.png`,
		boxText: { x: 58, y: 346 - 18, w: 170, h: 18 * 4 },
		boxImage: { x: 52, y: 326, w: 175, h: 81 },
		font: { family: 'Dilbert', size: 18, hs: 5, vs: 18 },
		color: '#fff',
	},
	bluNeko: {
		base: `${path}blu_neko.png`,
		boxImage: { x: 180, y: 488, w: 414, h: 307 },
		boxText: { x: 195, y: 506, w: 390, h: 281 },
		font: { family: 'Anisa', size: 56, hs: 10 },
		color: '#fff',
	},
	hibiki: {
		base: `${path}hibiki.png`,
		rotate: { x: 40.00, y: 300.00, angle: -20.00 },
		boxImage: { x: 36, y: 290, w: 490, h: 350 },
		boxText: { x: 46, y: 308, w: 468, h: 318 },
		font: { family: 'Anisa', size: 56, hs: 10 },
		color: '#fff',
	},
	shy: {
		base: `${path}shy.png`,
		rotate: { x: 369.00, y: 441.00, angle: 3.16 },
		boxImage: { x: 358, y: 432, w: 458, h: 427 },
		boxText: { x: 376, y: 454, w: 420, h: 391 },
		font: { family: 'Anisa', size: 56, hs: 10 },
		color: '#fff',
	},
	pink: {
		base: `${path}pink.png`,
		rotate: { x: 488.00, y: 133.00, angle: -10.27 },
		boxImage: { x: 485, y: 129, w: 663, h: 431 },
		boxText: { x: 497, y: 193, w: 635, h: 304 },
		font: { family: 'Anisa', size: 100, hs: 10 },
		color: '#fff',
		mask: `${path}pink_mask.png`,
	},
};
