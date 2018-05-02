'use strict';

const path = require('path');

const pkg = require(path.resolve('package.json'));
const permNodes = require(path.resolve('permNodes.json'));
const config = require(path.resolve('config/main.json'));

const Router = require('./Router');
const Route = require('./Route');

class ServiceRouter extends Router {
	constructor(errorHandler) {
		const info = new Route('ALL', '/', [], false);
		info.call = () => ({ version: pkg.version, message: `Welcome to the ${pkg.name} API` });
		const permnode = new Route('ALL', '/permnode', [], false);
		permnode.call = () => ({ apiIdentifier: `${pkg.name}-${config.env}`, permNodes });
		super('Service', [info, permnode], errorHandler);
	}
}

module.exports = ServiceRouter;
