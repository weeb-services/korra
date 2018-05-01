'use strict';

for (const file of require('fs').readdirSync(__dirname)) {
	if (file === 'index.js') {
		continue;
	}
	const mod = file.split('.')[0];
	module.exports[mod] = require(`./${mod}`);
}
