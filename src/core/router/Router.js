'use strict';

const { Router: ExpressRouter } = require('express');
const winston = require('winston');

const { HTTPCodes, DefaultResponses } = require('../Constants');
const Route = require('./Route');
const Util = require('../utils/Util');

const handleResponse = (res, response) => {
	// If there is no response set we assume the endpoint responds on its own
	if (response == null) {
		return;
	}
	// If it's a number we create a default response for the code
	if (typeof response === 'number') {
		return res.status(response).json({ status: response, message: DefaultResponses[response] });
	}

	// Add response status if not present
	if (!response.status) {
		response.status = HTTPCodes.OK;
	}
	// There must be a message when the code is not 200
	if (response.status !== HTTPCodes.OK && !response.message) {
		response.message = DefaultResponses[response.status];
	}

	res.status(response.status).json(response);
};

class Router {
	/**
	 * Creates a new Router
	 *
	 * @param {string} name The name of this router
	 * @param {Route[]} routes The Routes to be registered on this router
	 * @param {(e: Error, req: Express.Request, res: Express.Response) => void} errorHandler A custom error handler for handling route errors
	 */
	constructor(name, routes, errorHandler) {
		this._name = name;
		this._router = new ExpressRouter();

		// Check for error handler, otherwise use default one
		if (!errorHandler || typeof errorHandler !== 'function') {
			errorHandler = (error, req, res) => {
				try {
					winston.error(error);
				} catch (e) {
					// Ignore
				}

				handleResponse(res, HTTPCodes.INTERNAL_SERVER_ERROR);
			};
		}

		// Function for wrapping a route
		const wrapRoute = (route, alias) => {
			return async (req, res) => {
				try {
					// Permission check and abort if no perms
					if (!Util.checkPermissions(req.account, route.permissions, route.requireAccount)) {
						return res.status(HTTPCodes.FORBIDDEN).json(Util.buildMissingScopeMessage(
							req.appName || 'unset',
							req.config ? req.config.env : 'unset',
							route.permissions,
						));
					}

					// Forward call and handle its response
					handleResponse(res, await route.call(req, res, alias));
				} catch (e) {
					errorHandler(e, req, res);
				}
			};
		};

		for (let route of routes) {
			// Check if we have a class or an instance first
			if (!(route instanceof Route)) {
				// We have no Route instance so we're trying to instantiate it
				try {
					// eslint-disable-next-line new-cap
					route = new route();
				} catch (e) {
					winston.warn(`Could not instantiate a given route. Skipping...`);
					winston.warn(e);
					continue;
				}
			}

			// Check if it is an instance of Route
			if (!(route instanceof Route)) {
				winston.warn(`A given route does not extend class Route. Skipping...`);
				continue;
			}

			// Register on ExpressRouter for every alias there is
			for (const alias of route.aliases) {
				// Validate the aliases method
				if (!Route.Methods.includes(alias.method)) {
					winston.warn(`Route alias ${alias.method} ${alias.path} has an invalid HTTP method. Skipping...`);
					continue;
				}

				// Register
				this._router[alias.method.toLowerCase()](alias.path, wrapRoute(route, alias));

				winston.info(`Registered route ${alias.method} ${alias.path} on router "${this.name}"`);
			}
		}
	}

	get name() {
		return this._name;
	}

	/**
	 * Registeres this router on an express app
	 * @param {Express.Application} app The express app
	 */
	register(app) {
		app.use(this._router);

		winston.info(`Registered router "${this.name}"`);
	}
}

module.exports = Router;
