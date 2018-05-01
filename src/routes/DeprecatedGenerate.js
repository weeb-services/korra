'use strict';

const { Route, Constants: { HTTPCodes } } = require('../core');

const GenerateAwooo = require('./GenerateAwooo');

class Generate extends Route {
	constructor() {
		super('GET', '/generate', ['generate-simple']);

		this.awooo = new GenerateAwooo();
	}

	async call(req, res) {
		if (req.query.type === 'awooo') {
			this.awooo.call({
				query: {
					hair: req.query.hair,
					face: req.query.face,
				},
			}, res);
		} else {
			return {
				status: HTTPCodes.BAD_REQUEST,
				message: 'Invalid type',
			};
		}
	}
}

module.exports = Generate;
