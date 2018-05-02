'use strict';

const winston = require('winston');

winston.configure({
	transports: [
		new winston.transports.Console(),
	],
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.timestamp(),
		winston.format.align(),
		winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
	),
});

module.exports = {
	Async: require('./utils/Async'),
	Constants: require('./Constants'),
	FileCache: require('./utils/FileCache'),
	Middleware: require('./middleware/Middleware'),
	Require: require('./utils/Require'),
	Route: require('./router/Route'),
	Router: require('./router/Router'),
	ServiceRouter: require('./router/ServiceRouter'),
	Util: require('./utils/Util'),
	WildcardRouter: require('./router/WildcardRouter'),
};
