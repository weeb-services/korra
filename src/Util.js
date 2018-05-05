'use strict';

const util = require('util');

class Util {
	static validateBox(box, prefix = '') {
		if (!box || isNaN(box.x) || isNaN(box.y) || isNaN(box.w) || isNaN(box.h)) {
			throw new Error(`${prefix ? prefix + ': ' : ''}Invalid box: ${util.inspect(box, false, 1)}`);
		}
	}

	static validateRotate(rotate, prefix = '') {
		if (!rotate || isNaN(rotate.x) || isNaN(rotate.y) || isNaN(rotate.angle)) {
			throw new Error(`${prefix ? prefix + ': ' : ''}Invalid rotate: ${util.inspect(rotate, false, 1)}`);
		}
	}
}

module.exports = Util;
