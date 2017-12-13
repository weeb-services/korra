const Jimp = require('jimp');
const helper = require('../helper');
const statusConstants = require('../structures/statusConstants');

async function _generate(status, avatar) {
    let image = await Jimp.read(avatar);
    image.cover(statusConstants.side, statusConstants.side, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
        .scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            let main = helper.distance(x, y, statusConstants.center, statusConstants.center);
            let circle = helper.distance(x, y, statusConstants.circlex, statusConstants.circley);

            if (circle < statusConstants.circleo) {
                this.bitmap.data[idx + 3] = circle > statusConstants.circler ? 0 : 255;
                if (circle <= statusConstants.circler) {
                    this.bitmap.data[idx] = statusConstants.statusTypes[status][0];
                    this.bitmap.data[idx + 1] = statusConstants.statusTypes[status][1];
                    this.bitmap.data[idx + 2] = statusConstants.statusTypes[status][2];
                }
            } else if (main >= statusConstants.radius) {
                this.bitmap.data[idx + 3] = main > statusConstants.radius ? 0 : 100;
            }
        });
    return image;
}

module.exports.generate = async function (status, avatar) {
    let image = await _generate(status, avatar);
    return helper.getBuffer(image, Jimp.MIME_PNG);
};
