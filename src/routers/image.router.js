'use strict';
const GenerationError = require('../structures/GenerationError');
const BaseRouter = require('@weeb_services/wapi-core').BaseRouter;
const HTTPCodes = require('@weeb_services/wapi-core').Constants.HTTPCodes;
const generations = require('../structures/generationParams');
const ImageController = require('../controllers/image.controller');
const statusTypes = require('../structures/statusConstants').statusTypes;
const helper = require('../helper');
let imageController = new ImageController();
const schemas = require('../schemas/index');
const shortid = require('shortid');
const pkg = require('../../package');
let templateRequestCache = {};
const winston = require('winston');

class ImageRouter extends BaseRouter {
    constructor() {
        super();
        this.router()
            .get('/generate', async(req, res) => {
                try {
                    if (req.account && !req.account.perms.all && !req.account.perms.generate_simple) {
                        return res.status(HTTPCodes.FORBIDDEN)
                            .json({
                                status: HTTPCodes.FORBIDDEN,
                                message: `missing scope ${pkg.name}-${req.config.env}:generate_simple`,
                            });
                    }
                    if (!req.query.type) {
                        return res.status(400)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: `Missing type parameter, use one of the allowed types`,
                                allowedTypes: Object.keys(generations)
                            });
                    }
                    if (!generations[req.query.type]) {
                        return res.status(400)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: `Invalid type, use one of the allowed types`,
                                allowedTypes: Object.keys(generations)
                            });
                    }

                    let file = await imageController.generate(req.query.type, req.query, !!req.query.original);
                    res.set('Content-Type', 'image/png');
                    return res.status(200)
                        .send(file);
                } catch (e) {
                    if (req.Raven) {
                        helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                    }
                    winston.error(e);
                    return res.status(500)
                        .json({
                            status: HTTPCodes.INTERNAL_SERVER_ERROR,
                            message: 'Internal Server Error',
                            error: e.toString()
                        });
                }
            });
        this.router()
            .get('/discord-status', async(req, res) => {
                try {
                    if (req.account && !req.account.perms.all && !req.account.perms.generate_simple) {
                        return res.status(HTTPCodes.FORBIDDEN)
                            .json({
                                status: HTTPCodes.FORBIDDEN,
                                message: `missing scope ${pkg.name}-${req.config.env}:generate_simple`,
                            });
                    }
                    let status = 'online';
                    let avatar = 'https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png';
                    let image;
                    if (req.query.status) {
                        if (Object.keys(statusTypes)
                                .indexOf(req.query.status) === -1) {
                            return res.status(HTTPCodes.BAD_REQUEST)
                                .json({
                                    status: HTTPCodes.BAD_REQUEST,
                                    message: `Invalid status, use one of the allowed statuses`,
                                    allowedStatuses: Object.keys(statusTypes)
                                });
                        }
                        status = req.query.status;
                    }
                    try {
                        image = await helper.getImage(req.query.avatar ? req.query.avatar : avatar);
                    } catch (e) {
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: `This url is not allowed.`
                            });
                    }
                    let file = await imageController.generateStatus(status, image);
                    res.set('Content-Type', 'image/png');
                    return res.status(200)
                        .send(file);
                } catch (e) {
                    if (req.Raven) {
                        helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                    }
                    winston.error(e);
                    return res.status(HTTPCodes.INTERNAL_SERVER_ERROR)
                        .json({
                            status: HTTPCodes.INTERNAL_SERVER_ERROR,
                            message: 'Internal Server Error',
                            error: e.toString()
                        });
                }
            });
        this.router()
            .post('/license', async(req, res) => {
                if (req.account && !req.account.perms.all && !req.account.perms.generate_license) {
                    return res.status(HTTPCodes.FORBIDDEN)
                        .json({
                            status: HTTPCodes.FORBIDDEN,
                            message: `missing scope ${pkg.name}-${req.config.env}:generate_license`,
                        });
                }
                let bodyCheck = schemas.license.validate(req.body);
                if (bodyCheck.error) {
                    return res.status(HTTPCodes.BAD_REQUEST)
                        .json({
                            status: HTTPCodes.BAD_REQUEST,
                            message: bodyCheck.error.toString(),
                            in: 'body'
                        });
                }
                try {
                    helper.verifyUrl(req.body.avatar);
                    if (req.body.widgets) {

                    } else {
                        req.body.widgets = [];
                    }
                    if (req.body.badges && req.body.badges.length > 0) {
                        for (let badge of req.body.badges) {
                            helper.verifyUrl(badge);
                        }
                    } else {
                        req.body.badges = [];
                    }
                } catch (e) {
                    winston.error(e);
                    return res.status(HTTPCodes.BAD_REQUEST)
                        .json({
                            status: HTTPCodes.BAD_REQUEST,
                            message: 'invalid url'
                        });
                }
                let requestId = shortid.generate();
                templateRequestCache[requestId] = req.body;
                let imageUrls = [].concat(req.body.badges, [req.body.avatar]);
                try {
                    let file = await imageController.generateLicense(req.browser, req.config.host, req.config.port, requestId, imageUrls);
                    res.set('Content-Type', 'image/png');
                    delete templateRequestCache[requestId];
                    return res.status(HTTPCodes.OK)
                        .send(file);
                } catch (e) {
                    delete templateRequestCache[requestId];
                    if (e instanceof GenerationError) {
                        if (req.Raven) {
                            helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                        }
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: 'Failed to generate image',
                                error: e.toString()
                            });
                    } else {
                        if (req.Raven) {
                            helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                        }
                        winston.error(e);
                        return res.status(HTTPCodes.INTERNAL_SERVER_ERROR)
                            .json({
                                status: HTTPCodes.INTERNAL_SERVER_ERROR,
                                message: 'Internal Server Error',
                                error: e.toString()
                            });
                    }
                }
            });
        this.router()
            .post('/waifu-insult', async(req, res) => {
                if (req.account && !req.account.perms.all && !req.account.perms.generate_waifu_insult) {
                    return res.status(HTTPCodes.FORBIDDEN)
                        .json({
                            status: HTTPCodes.FORBIDDEN,
                            message: `missing scope ${pkg.name}-${req.config.env}:generate_waifu_insult`,
                        });
                }
                let bodyCheck = schemas.waifuInsult.validate(req.body);
                if (bodyCheck.error) {
                    return res.status(HTTPCodes.BAD_REQUEST)
                        .json({
                            status: HTTPCodes.BAD_REQUEST,
                            message: bodyCheck.error.toString(),
                            in: 'body'
                        });
                }
                try {
                    helper.verifyUrl(req.body.avatar);
                } catch (e) {
                    winston.error(e);
                    return res.status(HTTPCodes.BAD_REQUEST)
                        .json({
                            status: HTTPCodes.BAD_REQUEST,
                            message: 'invalid avatar url'
                        });
                }
                let requestId = shortid.generate();
                templateRequestCache[requestId] = req.body;
                try {
                    let file = await imageController.generateWaifuInsult(req.browser, req.config.host, req.config.port, requestId, [req.body.avatar]);
                    res.set('Content-Type', 'image/png');
                    delete templateRequestCache[requestId];
                    return res.status(HTTPCodes.OK)
                        .send(file);
                } catch (e) {
                    delete templateRequestCache[requestId];
                    if (e instanceof GenerationError) {
                        if (req.Raven) {
                            helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                        }
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: 'Failed to generate image',
                                error: e.toString()
                            });
                    } else {
                        if (req.Raven) {
                            helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                        }
                        winston.error(e);
                        return res.status(HTTPCodes.INTERNAL_SERVER_ERROR)
                            .json({
                                status: HTTPCodes.INTERNAL_SERVER_ERROR,
                                message: 'Internal Server Error',
                                error: e.toString()
                            });
                    }
                }
            });
        this.router()
            .post('/love-ship', async(req, res) => {
                if (req.account && !req.account.perms.all && !req.account.perms.generate_love_ship) {
                    return res.status(HTTPCodes.FORBIDDEN)
                        .json({
                            status: HTTPCodes.FORBIDDEN,
                            message: `missing scope ${pkg.name}-${req.config.env}:generate_love_ship`,
                        });
                }
                let bodyCheck = schemas.loveShip.validate(req.body);
                if (bodyCheck.error) {
                    return res.status(HTTPCodes.BAD_REQUEST)
                        .json({
                            status: HTTPCodes.BAD_REQUEST,
                            message: bodyCheck.error.toString(),
                            in: 'body'
                        });
                }
                try {
                    helper.verifyUrl(req.body.targetOne);
                    helper.verifyUrl(req.body.targetTwo);
                } catch (e) {
                    winston.error(e);
                    return res.status(HTTPCodes.BAD_REQUEST)
                        .json({
                            status: HTTPCodes.BAD_REQUEST,
                            message: 'invalid avatar url'
                        });
                }
                let requestId = shortid.generate();
                templateRequestCache[requestId] = req.body;
                try {
                    let file = await imageController.generateLoveShip(req.browser, req.config.host, req.config.port, requestId, [req.body.targetOne, req.body.targetTwo]);
                    res.set('Content-Type', 'image/png');
                    delete templateRequestCache[requestId];
                    return res.status(HTTPCodes.OK)
                        .send(file);
                } catch (e) {
                    delete templateRequestCache[requestId];
                    if (e instanceof GenerationError) {
                        if (req.Raven) {
                            helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                        }
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: 'Failed to generate image',
                                error: e.toString()
                            });
                    } else {
                        if (req.Raven) {
                            helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                        }
                        winston.error(e);
                        return res.status(HTTPCodes.INTERNAL_SERVER_ERROR)
                            .json({
                                status: HTTPCodes.INTERNAL_SERVER_ERROR,
                                message: 'Internal Server Error',
                                error: e.toString()
                            });
                    }
                }
            });
        this.router()
            .get('/license-template', async(req, res) => {
                try {
                    if (!req.query.requestId) {
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: 'invalid request'
                            });
                    }
                    if (!templateRequestCache[req.query.requestId]) {
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: 'invalid request'
                            });
                    }
                    return res.render('license', templateRequestCache[req.query.requestId]);
                } catch (e) {
                    if (req.Raven) {
                        helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                    }
                    winston.error(e);
                    return res.status(500)
                        .json({
                            status: HTTPCodes.INTERNAL_SERVER_ERROR,
                            message: 'Internal Server Error',
                            error: e.toString()
                        });
                }
            });
        this.router()
            .get('/waifu-insult-template', async(req, res) => {
                try {
                    if (!req.query.requestId) {
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: 'invalid request'
                            });
                    }
                    if (!templateRequestCache[req.query.requestId]) {
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: 'invalid request'
                            });
                    }
                    return res.render('waifuinsult', templateRequestCache[req.query.requestId]);
                } catch (e) {
                    if (req.Raven) {
                        helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                    }
                    winston.error(e);
                    return res.status(500)
                        .json({
                            status: HTTPCodes.INTERNAL_SERVER_ERROR,
                            message: 'Internal Server Error',
                            error: e.toString()
                        });
                }
            });
        this.router()
            .get('/love-ship-template', async(req, res) => {
                try {
                    if (!req.query.requestId) {
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: 'invalid request'
                            });
                    }
                    if (!templateRequestCache[req.query.requestId]) {
                        return res.status(HTTPCodes.BAD_REQUEST)
                            .json({
                                status: HTTPCodes.BAD_REQUEST,
                                message: 'invalid request'
                            });
                    }
                    return res.render('loveship', templateRequestCache[req.query.requestId]);
                } catch (e) {
                    if (req.Raven) {
                        helper.trackErrorRaven(req.Raven, e, {req, user: req.account});
                    }
                    winston.error(e);
                    return res.status(500)
                        .json({
                            status: HTTPCodes.INTERNAL_SERVER_ERROR,
                            message: 'Internal Server Error',
                            error: e.toString()
                        });
                }
            });
    }
}

module.exports = ImageRouter;
