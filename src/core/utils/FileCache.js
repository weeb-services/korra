'use strict';

const fs = require('fs');
const path = require('path');

const Async = require('./Async');

class FileCache {
	constructor(directory, encoding) {
		this._path = path.resolve(directory);
		this._encoding = encoding;

		this._files = {};
		this._size = 0;
	}

	async _getFileList(filePath = this._path) {
		const list = await Async.readdir(filePath);
		const promises = [];

		for (const item of list) {
			const itemPath = path.resolve(filePath, item);
			promises.push(new Promise((resolve, reject) => {
				Async.lstat(itemPath).then(stats => {
					if (stats.isDirectory()) {
						return this._getFileList(itemPath).then(resolve).catch(reject);
					}

					resolve({ absolute: itemPath, relative: path.relative(this._path, itemPath) });
				}).catch(reject);
			}));
		}

		const results = await Promise.all(promises);

		const flatten = (flat, toFlatten) => {
			return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
		};

		return results.reduce(flatten, []).filter(item => item != null);
	}

	async load() {
		if (!fs.existsSync(this._path)) {
			throw new Error(`FileCache: Directory ${this._path} does not exist`);
		}

		const list = await this._getFileList(this._path);
		const promises = [];
		for (const item of list) {
			promises.push(new Promise((resolve, reject) => {
				Async.readFile(item.absolute, this._encoding).then(data => {
					item.data = data;
					resolve();
				}).catch(reject);
			}));
		}

		await Promise.all(promises);

		const newFiles = {};
		for (const item of list) {
			newFiles[item.relative] = item.data;
			newFiles[item.absolute] = item.data;
		}

		this._files = newFiles;
		this._size = Object.keys(this._files).length / 2;
	}

	get(filePath) {
		return this._files[filePath] || null;
	}

	get path() {
		return this._path;
	}

	get encoding() {
		return this._encoding;
	}

	get size() {
		return this._size;
	}
}

module.exports = FileCache;
