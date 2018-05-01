'use strict';

const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);

class Async {
	static async readdir(args) {
		return readdir(...args);
	}
}

module.exports = Async;
