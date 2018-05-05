'use strict';

const {
	Router,
	Require,
	FileCache,
	Middleware,
	Util,
	WeebAPI,
} = require('@weeb_services/wapi-core');

Util.configureWinston(require('winston'));

const winston = require('winston');

const routes = Require.recursive('src/routes');

class Korra extends WeebAPI {
	constructor() {
		super();
		this.resCache = null;
	}

	async onLoaded() {
		// Load resources
		this.resCache = new FileCache('./resources');
		const resLoadStart = Date.now();
		await this.resCache.load();
		winston.info(`Loaded ${this.resCache.size} resources in ${Date.now() - resLoadStart}ms`);
	}

	async registerMiddlewares(app) {
		// Middleware for supplying the resource cache
		new Middleware('ResCache Supplier', this.onError.bind(this), req => {
			req.resCache = this.resCache;
		}).register(app);
	}

	async registerRouters(app) {
		new Router('ImageGen', routes, this.onError.bind(this)).register(app);
	}
}

new Korra().init();
