const Jimp = require('jimp');
const helper = require('../helper');

async function _colorize(typeParams) {
    let base = await Jimp.read(typeParams.base);
    for (let element of Object.keys(typeParams.elements)) {
        element = typeParams.elements[element];
        let image = await Jimp.read(element.image);
        if (image.bitmap.width !== image.bitmap.width || image.bitmap.height !== image.bitmap.height) {
            throw new Error('Error coloring mask ' + typeParams.indexOf(element) + ', mask and base image size should match');
        }
        _applyColor(base, image, element.rgbColor);
    }
    return base;
}

function _applyColor(base, image, color) {
    for (let i = 0; i < base.bitmap.width * base.bitmap.height * 4; i += 4) {
        if (image.bitmap.data[i] === 255 && image.bitmap.data[i + 1] === 255 && image.bitmap.data[i + 2] === 255) {
            for (let n = 0; n < color.length; n++) {
                base.bitmap.data[i + n] = color[n];
            }
        }
    }
}

module.exports.generate = async function (typeParams) {
    let image = await _colorize(typeParams);
    return helper.getBuffer(image, Jimp.MIME_PNG);
};
