'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const cors = require('cors');

const pkg = require('../package.json');
const permNodes = require('./permNodes.json');

const GenericRouter = require('wapi-core').GenericRouter;
const WildcardRouter = require('wapi-core').WildcardRouter;

const ImageRouter = require('./routers/image.router');

const AuthMiddleware = require('wapi-core').AccountAPIMiddleware;
const PermMiddleware = require('wapi-core').PermMiddleware;

const puppeteer = require('puppeteer');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    timestamp: true,
    colorize: true,
});

let init = async () => {
    let config;
    try {
        config = require('../config/main.json');
    } catch (e) {
        winston.error(e);
        winston.error('Failed to require config.');
        return process.exit(1);
    }
    winston.info('Config loaded.');

    // Initialize express
    let app = express();

    const browser = await puppeteer.launch();
    // Middleware for config
    app.use((req, res, next) => {
        req.config = config;
        req.browser = browser;
        next();
    });

    // Some other middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cors());

    app.use('/get-the-awoo-off-my-lawn', express.static('resources'));
    app.use('/get-the-awoo-off-my-lawn', express.static('views'));

    // Auth middleware
    app.use(new AuthMiddleware(config.irohHost, `${pkg.name}-${config.env}`, config.whitelist).middleware());

    app.use(new PermMiddleware().middleware());

    // Routers
    app.use(new GenericRouter(pkg.version, `Welcome to the ${pkg.name} api`, `${pkg.name}-${config.env}`, permNodes).router());

    // add custom routers here:
    app.use(new ImageRouter().router());
    // Always use this last
    app.use(new WildcardRouter().router());

    app.set('view engine', 'ejs');

    app.listen(config.port, config.host);
    winston.info(`Server started on ${config.host}:${config.port}`);
    process.once('exit', () => {
        browser.close();
    });
};

init()
    .catch(e => {
        winston.error(e);
        winston.error('Failed to initialize.');
        process.exit(1);
    });
