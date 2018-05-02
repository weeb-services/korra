'use strict';

const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const lstat = util.promisify(fs.lstat);

class Async {
	static async readdir(...args) {
		return readdir(...args);
	}

	static async readFile(...args) {
		return readFile(...args);
	}

	static async lstat(...args) {
		return lstat(...args);
	}
}

module.exports = Async;
