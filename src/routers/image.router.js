'use strict';

const pkg = require('../../package');

const winston = require('winston');

const BaseRouter = require('@weeb_services/wapi-core').BaseRouter;
const HTTPCodes = require('@weeb_services/wapi-core').Constants.HTTPCodes;
const { checkPermissions, buildMissingScopeMessage } = require('@weeb_services/wapi-core').Utils;

const helper = require('../helper');
const awooo = require('../generators/awooo');

class ImageRouter extends BaseRouter {
	constructor() {
		super();

		const get = (path, func) => {
			this.router().get(path, async (req, res) => {
				try {
					await func(req, res);
				} catch (e) {
					if (req.Raven) {
						helper.trackErrorRaven(req.Raven, e, { req, user: req.account });
					}
					winston.error(e);
					return res.status(500).json({
						status: HTTPCodes.INTERNAL_SERVER_ERROR,
						message: 'Internal Server Error',
						error: e.toString(),
					});
				}
			});
		};

		get('/awooo', async (req, res) => {
			if (!checkPermissions(req.account, ['generate_simple'])) {
				return res.status(HTTPCodes.FORBIDDEN).json({
					status: HTTPCodes.FORBIDDEN,
					message: buildMissingScopeMessage(pkg.name, req.config.env, ['generate_simple']),
				});
			}

			awooo(req.query, res);
		});

		// DEPRECATED
		get('/generate', async (req, res) => {
			if (!checkPermissions(req.account, ['generate_simple'])) {
				return res.status(HTTPCodes.FORBIDDEN).json({
					status: HTTPCodes.FORBIDDEN,
					message: buildMissingScopeMessage(pkg.name, req.config.env, ['generate_simple']),
				});
			}

			if (req.query.type === 'awooo') {
				awooo({
					hair: req.query.hair,
					face: req.query.face,
				}, res);
			} else {
				return res.status(HTTPCodes.BAD_REQUEST).json({
					status: HTTPCodes.BAD_REQUEST,
					message: 'Invalid type',
				});
			}
		});
	}
}

module.exports = ImageRouter;
