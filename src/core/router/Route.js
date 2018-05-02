'use strict';

const winston = require('winston');

class Route {
	/**
	 * Creates a new Route
	 *
	 * @param {string} method The HTTP method to be used for the route. "ALL" for all methods
	 * @param {string} path The path this route should be registered on
	 * @param {string[]=} permissions The permissions needed to use this route
	 */
	constructor(method, path, permissions, requireAccount = true) {
		this.method = method.toUpperCase();
		this.path = path;

		this._aliases = [];
		this._permissions = permissions || [];
		this._requireAccount = Boolean(requireAccount);

		this.alias(method, path);
	}

	alias(method, path) {
		this.aliases.push({ method, path });
	}

	get aliases() {
		return this._aliases;
	}

	get permissions() {
		return this._permissions;
	}

	get requireAccount() {
		return this._requireAccount;
	}

	/**
	 * @param {Express.Request} req The express Request object
	 * @param {Express.Response} res The express Response object
	 */
	async call() {
		winston.warn(`Route ${this.method} ${this.path} has not overridden the call handler.`);
	}
}

Route.Methods = ['ALL', 'GET', 'POST', 'PUT', 'DELETE'];

module.exports = Route;
