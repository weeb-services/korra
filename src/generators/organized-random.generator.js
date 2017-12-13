const Jimp = require('jimp');
const helper = require('../helper');

async function _compose(typeParams, original) {
    let base = await Jimp.read(typeParams.base);
    for (let element of typeParams.elements) {
        let img = await Jimp.read(element.image);
        let x = 0, y = 0;
        if (!original) {
            let angle = helper.getRandomArbitrary(0, Math.PI * 2);
            x += helper.getRandomArbitrary(helper.def(element.min, 0), helper.def(element.max, 10));
            let xp = x;
            let yp = y;
            x = (xp * Math.cos(angle) - yp * Math.sin(angle)) * helper.def(element.scale_x, 1) + element.base_position[0];
            y = (yp * Math.cos(angle) + xp * Math.sin(angle)) * helper.def(element.scale_y, 1) + element.base_position[1];
        } else {
            x += element.original_position[0];
            y += element.original_position[1];
        }
        base = base.composite(img, Math.round(x), Math.round(y));
    }
    return base;
}

module.exports.generate = async function generate(typeParams, original) {
    let image = await _compose(typeParams, original);
    return helper.getBuffer(image, Jimp.MIME_PNG);
};
