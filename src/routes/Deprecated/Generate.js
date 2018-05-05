'use strict';

const { Route, Constants: { HTTPCodes } } = require('@weeb_services/wapi-core');

const GenerateAwooo = require('../GenerateAwooo');

class Generate extends Route {
	constructor() {
		super('GET', '/generate', ['generate-simple']);

		this.awooo = new GenerateAwooo();
	}

	async call(req, res) {
		if (req.query.type === 'awooo') {
			return this.awooo.call({
				resCache: req.resCache,
				query: {
					hair: req.query.hair,
					face: req.query.face,
				},
			}, res);
		}

		return {
			status: HTTPCodes.BAD_REQUEST,
			message: 'Invalid type',
		};
	}
}

module.exports = Generate;
