'use strict';

const {
	Async,
	Router,
	Require,
	FileCache,
	Middleware,
	Util,
	WeebAPI,
} = require('@weeb_services/wapi-core');

Util.configureWinston(require('winston'));

const { registerFont } = require('canvas');
const winston = require('winston');

const routes = Require.recursive('src/routes');

class Korra extends WeebAPI {
	constructor() {
		super({
			enableAccounts: false,
		});
		this.resCache = null;
	}

	async onLoaded() {
		// Load images
		this.resCache = new FileCache('./res/img');
		let start = Date.now();
		await this.resCache.load();
		winston.info(`Loaded ${this.resCache.size} images in ${Date.now() - start}ms`);

		// Register fonts
		start = Date.now();
		const fontList = await Async.readdir('res/font');
		for (const font of fontList) {
			registerFont(`res/font/${font}`, { family: font.split('.')[0] });
		}
		winston.info(`Loaded ${fontList.length} fonts in ${Date.now() - start}ms`);
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
