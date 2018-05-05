'use strict';

const { Route, Constants: { HTTPCodes } } = require('@weeb_services/wapi-core');

const GenerateTemplate = require('../GenerateTemplate');

class WaifuInsult extends Route {
	constructor() {
		super('GET', '/waifu-insult', ['generate-simple']);

		this.template = new GenerateTemplate();
	}

	async call(req, res) {
		if (!req.query.avatar) {
			return {
				status: HTTPCodes.BAD_REQUEST,
				message: 'No avatar provided',
			};
		}

		return this.template.call({
			resCache: req.resCache,
			query: {
				image: req.query.avatar,
			},
			params: {
				name: 'waifu-insult',
			},
		}, res);
	}
}

module.exports = WaifuInsult;
