const templates = require('../../resources/simple-template/templates');
const compose = require('../functions/compose');

async function simpleTemplate(query, res) {
	let canvas;
	try {
		if (!templates[query.type]) {
			throw new Error(`Uknown template name ${query.type}`);
		}

		canvas = await compose(templates[query.type], { text: query.text || 'I forgot to give any text', image: query.image, mode: query.mode });
	} catch (e) {
		return res.set('Content-Type', 'text/plain').status(400).end(e.message);
	}

	res.set('Content-Type', 'image/png');
	return canvas.pngStream().pipe(res.status(200));
}

module.exports = simpleTemplate;
