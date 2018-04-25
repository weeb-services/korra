const axios = require('axios');
const Url = require('url');
const winston = require('winston');

function getRandomArbitrary(min, max) {
	return (Math.random() * (max - min)) + min;
}

function def(val, defVal) {
	return val === undefined ? defVal : val;
}

function getBuffer(image, mime) {
	return new Promise((resolve, reject) => {
		image.getBuffer(mime, (err, buffer) => {
			if (err) {
				return reject(err);
			}
			return resolve(buffer);
		});
	});
}

function distance(x, y, cx, cy) {
	const a = x - cx;
	const b = y - cy;

	return Math.sqrt((a * a) + (b * b));
}

function _checkImageType(type) {
	switch (type) {
		case 'image/jpeg':
			break;
		case 'image/png':
			break;
		case 'image/gif':
			break;
		default:
			throw new Error(`Filetype ${type} is not supported`);
	}
}

async function getImage(imageUrl) {
	const url = verifyUrl(imageUrl);
	const head = await axios.head(url.href);
	_checkImageType(head.headers['content-type']);
	const request = await axios.get(url.href, { responseType: 'arraybuffer' });
	return request.data;
}

function verifyUrl(url) {
	return Url.parse(url);
}

function trackErrorRaven(Raven, error, data) {
	Raven.captureException(error, data, err => {
		winston.error(err);
	});
}

/**
 * @description Returns all matches of re on sourceString
 * @param {string} sourceString Thy string
 * @param {RegExp} re Thy regexp
 */
function findAll(sourceString, re, aggregator = []) {
	const arr = re.exec(sourceString);

	if (arr === null) return aggregator;

	const newString = sourceString.slice(arr.index + arr[0].length);
	return findAll(newString, re, aggregator.concat([arr]));
}

module.exports = { getRandomArbitrary, def, getBuffer, distance, getImage, verifyUrl, trackErrorRaven, findAll };
