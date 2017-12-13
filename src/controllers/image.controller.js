const generations = require('../structures/generationParams');
const organizedRandomGenerator = require('../generators/organized-random.generator');
const colorMaskGenerator = require('../generators/color-mask.generator');
const discordStatusGenerator = require('../generators/discord-status.generator');
const licenseGenerator = require('../generators/license-generator');
const TinyColor = require('tinycolor2');

class ImageController {
    async generate(type, params, original) {
        let typeParams = generations[type];
        switch (typeParams.generationType) {
            case 'org_random':
                return this._generateOrgRandom(typeParams, original);
            case 'colormask':
                return this._generateColorize(typeParams, params);
            default:
                break;
        }
    }

    async generateStatus(status, image) {
        return discordStatusGenerator.generate(status, image)
    }

    async generateLicense(browser, host, port, requestId) {
        return licenseGenerator.generate(browser, `http://${host}:${port}/license-template?requestId=${requestId}`);
    }

    async _generateOrgRandom(typeParams, original) {
        return organizedRandomGenerator.generate(typeParams, original);
    }

    async _generateColorize(typeParams, params) {
        for (let key of Object.keys(typeParams.elements)) {
            let color = TinyColor(typeParams.elements[key].color);
            let rgb = color.toRgb();
            typeParams.elements[key].rgbColor = [rgb.r, rgb.g, rgb.b];
            if (params[key]) {
                let color = TinyColor(params[key]);
                if (color.isValid()) {
                    let rgb = color.toRgb();
                    typeParams.elements[key].color = params[key];
                    typeParams.elements[key].rgbColor = [rgb.r, rgb.g, rgb.b];
                }
            }
        }
        return colorMaskGenerator.generate(typeParams);
    }
}

module.exports = ImageController;
