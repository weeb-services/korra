'use strict';

const {
	Router,
	Require,
	Constants: { HTTPCodes },
	FileCache,
	Middleware,
	WildcardRouter,
	ServiceRouter,
	Registrator,
	ShutdownHandler,
	Util,
	WeebAPI,
	PermMiddleware,
	IrohMiddleware,
} = require('@weeb_services/wapi-core');

Util.configureWinston(require('winston'));
WeebAPI.init();

const util = require('util');

const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const cors = require('cors');
const Raven = require('raven');

const helper = require('./helper');

const routes = Require.recursive('src/routes');

let registrator;
if (WeebAPI.get('config').registration && WeebAPI.get('config').registration.enabled) {
	registrator = new Registrator();
}

let shutdownManager;

const init = async () => {
	winston.info('Config loaded.');
	if (WeebAPI.get('config').ravenKey && WeebAPI.get('config').ravenKey !== '' && WeebAPI.get('config').env !== 'development') {
		Raven.config(WeebAPI.get('config').ravenKey, { release: WeebAPI.get('version'), environment: WeebAPI.get('config').env, captureUnhandledRejections: true })
			.install((err, sendErr, eventId) => {
				if (!sendErr) {
					winston.info('Successfully sent fatal error with eventId ' + eventId + ' to Sentry:');
					winston.error(err.stack);
				}
				winston.error(sendErr);
				process.exit(1);
			});
		Raven.on('error', e => {
			winston.error('Raven Error', e);
		});
	}

	// Load resources
	const resCache = new FileCache('./resources');
	const resLoadStart = Date.now();
	await resCache.load();
	winston.info(`Loaded ${resCache.size} resources in ${Date.now() - resLoadStart}ms`);

	// Initialize express
	const app = express();

	// Some other middleware
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cors());

	// Auth middleware
	new IrohMiddleware().register(app);

	/* If (WeebAPI.get('config').track) {
		app.use(new TrackMiddleware(WeebAPI.pkg.name, WeebAPI.pkg.version, WeebAPI.get('config').env, WeebAPI.get('config').track).middleware());
	} */

	new PermMiddleware().register(app);

	// Middleware for supplying the resource cache
	new Middleware('ResCache Supplier', null, req => {
		req.resCache = resCache;
	}).register(app);

	// Routers
	new ServiceRouter().register(app);

	new Router('ImageGen', routes, (e, req, res) => {
		try {
			if (req.Raven) {
				helper.trackErrorRaven(req.Raven, e, { req, user: req.account });
			}
			winston.error(e);
		} catch (e) {
			// Ignore
		}

		res.status(HTTPCodes.INTERNAL_SERVER_ERROR).json({
			status: HTTPCodes.INTERNAL_SERVER_ERROR,
			message: 'Internal Server Error',
		});
	}).register(app);

	// Always use this last
	new WildcardRouter().register(app);

	const server = app.listen(WeebAPI.get('config').port, WeebAPI.get('config').host);
	shutdownManager = new ShutdownHandler(server, registrator, null);

	winston.info(`Server started on ${WeebAPI.get('config').host}:${WeebAPI.get('config').port}`);

	if (registrator) {
		await registrator.register();
		winston.info(`Registered network service`);
	}
};

init()
	.catch(e => {
		winston.error(e);
		winston.error('Failed to initialize.');
		process.exit(1);
	});

process.on('SIGTERM', () => shutdownManager.shutdown());
process.on('SIGINT', () => shutdownManager.shutdown());
process.on('unhandledRejection', (reason, promise) => {
	winston.error(util.inspect(promise, { depth: 4 }));
});
