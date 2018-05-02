'use strict';

const Router = require('./Router');
const Route = require('./Route');

class WildcardRouter extends Router {
	constructor(errorHandler) {
		const route = new Route('ALL', '*', [], false);
		route.call = () => 404;
		super('Wildcard', [route], errorHandler);
	}
}

module.exports = WildcardRouter;
