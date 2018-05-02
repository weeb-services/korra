'use strict';

const winston = require('winston');

const { HTTPCodes, DefaultResponses } = require('../Constants');
const UrlPattern = require('url-pattern');

const getResponse = response => {
	// If there is no response set we assume we should continue
	if (response == null) {
		return { status: HTTPCodes.OK, message: DefaultResponses[HTTPCodes.OK] };
	}
	// If it's a number we create a default response for the code
	if (typeof response === 'number') {
		return { status: response, message: DefaultResponses[response] };
	}

	// Add response status if not present
	if (!response.status) {
		response.status = HTTPCodes.OK;
	}
	// There must be a message when the code is not 200
	if (response.status !== HTTPCodes.OK && !response.message) {
		response.message = DefaultResponses[response.status];
	}

	return response;
};

class Middleware {
	/**
	 * Creates a new Middleware
	 *
	 * @param {string} name The name of this middleware
	 * @param {(e: Error, req: Express.Request, res: Express.Response) => void} errorHandler A custom error handler for handling middleware errors
	 * @param {(req: Express.Request, res: Express.Response) => Promise<void | number | { status: number, message?: string }>} executor An optional Executor
	 */
	constructor(name, errorHandler, executor) {
		this._name = name;
		this._whitelistArray = [];
		this._executor = executor || null;

		// Check for error handler, otherwise use default one
		if (!errorHandler || typeof errorHandler !== 'function') {
			errorHandler = (error, req, res) => {
				try {
					winston.error(error);
				} catch (e) {
					// Ignore
				}

				const response = getResponse(res, HTTPCodes.INTERNAL_SERVER_ERROR);
				res.status(response.status).json(response);
			};
		}

		this._middleware = async (req, res, next) => {
			try {
				if (req.path) {
					for (let i = 0; i < this._whitelistArray.length; i++) {
						const entry = this._whitelistArray[i];
						if (entry.pattern.match(req.path.toLowerCase()) && (req.method.toLowerCase() === entry.method || entry.method === 'all')) {
							return next();
						}
					}
				}

				const response = getResponse(await this.exec(req, res));
				if (response.status === HTTPCodes.OK) {
					return next();
				}

				res.status(response.status).json(response);
			} catch (e) {
				errorHandler(e);
			}
		};
	}

	get name() {
		return this._name;
	}

	async exec(req, res) {
		if (this._executor) {
			return this._executor(req, res);
		}

		winston.warn(`Middleware "${this.name}" has not overridden the exec handler.`);
		return HTTPCodes.OK;
	}

	whitelist(path, method) {
		this._whitelistArray.push({ pattern: new UrlPattern(path), method: method || 'all' });
	}

	register(app) {
		app.use(this._middleware);

		winston.info(`Registered middleware "${this.name}"`);
	}
}

module.exports = Middleware;
