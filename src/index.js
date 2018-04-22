'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const cors = require('cors');

const pkg = require('../package.json');
const permNodes = require('./permNodes.json');

const GenericRouter = require('@weeb_services/wapi-core').GenericRouter;
const WildcardRouter = require('@weeb_services/wapi-core').WildcardRouter;

const ImageRouter = require('./routers/image.router');

const AuthMiddleware = require('@weeb_services/wapi-core').AccountAPIMiddleware;
const PermMiddleware = require('@weeb_services/wapi-core').PermMiddleware;
const TrackMiddleware = require('@weeb_services/wapi-core').TrackingMiddleware;

const Raven = require('raven');

const Registrator = require('@weeb_services/wapi-core').Registrator;
const ShutdownHandler = require('@weeb_services/wapi-core').ShutdownHandler;

const config = require('../config/main');
const util = require('util');

let registrator;

if (config.registration && config.registration.enabled) {
	registrator = new Registrator(config.registration.host, config.registration.token);
}
let shutdownManager;

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
	timestamp: true,
	colorize: true,
});

const init = async () => {
	winston.info('Config loaded.');
	if (config.ravenKey && config.ravenKey !== '' && config.env !== 'development') {
		Raven.config(config.ravenKey, { release: pkg.version, environment: config.env, captureUnhandledRejections: true })
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
	// Initialize express
	const app = express();

	// Some other middleware
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cors());

	// Auth middleware
	app.use(new AuthMiddleware(config.irohHost, `${pkg.name}-${config.env}`, config.whitelist).middleware());

	if (config.track) {
		app.use(new TrackMiddleware(pkg.name, pkg.version, config.env, config.track).middleware());
	}

	app.use(new PermMiddleware(pkg.name, config.env).middleware());

	// Routers
	app.use(new GenericRouter(pkg.version, `Welcome to the ${pkg.name} API`, `${pkg.name}-${config.env}`, permNodes).router());

	// Add custom routers here:
	app.use(new ImageRouter().router());

	// Always use this last
	app.use(new WildcardRouter().router());

	const server = app.listen(config.port, config.host);
	shutdownManager = new ShutdownHandler(server, registrator, null, pkg.serviceName);
	if (registrator) {
		await registrator.register(pkg.serviceName, [config.env], config.port);
	}
	winston.info(`Server started on ${config.host}:${config.port}`);
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
