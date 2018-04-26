'use strict';

const tinycolor = require('tinycolor2');
const fs = require('fs');
const util = require('util');
const { createCanvas, Image } = require('canvas');

const helper = require('../helper');
const drawText = require('../functions/draw-text');
const drawImage = require('../functions/draw-image');

const asyncReadFile = util.promisify(fs.readFile);

/*
{
	base: 'PATH',
	box: {x:0, y:0, w:0, h:0},
	boxText: {x:0, y:0, w:0, h:0},
	boxImage: {x:0, y:0, w:0, h:0},
	rotate: {x:0, y:0, angle: 0},
	font: {family: 'FACENAME', size: 0, vs: 0, hs: 0, color: '#000'},
	color: '#fff',
	mask: 'PATH'
}
*/

async function compose(template, options) {
	const base = await asyncReadFile(template.base);
	const baseImage = new Image();
	baseImage.src = base;

	const canvas = createCanvas(baseImage.width, baseImage.height); // Create a canvas with base image dimensions
	const ctx = canvas.getContext('2d');

	if (template.color) {
		if (tinycolor(template.color).isValid()) {
			ctx.fillStyle = template.color; // Paint it ~~black~~ color
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		} else {
			throw new Error(`Template color ${template.color} isn't valid`);
		}
	}

	ctx.save(); // Save the context's state

	if (template.rotate) {
		// Should we check that x and y and angle are given ?
		ctx.translate(template.rotate.x, template.rotate.y);
		ctx.rotate(template.rotate.angle * Math.PI / 180);
		ctx.translate(-template.rotate.x, -template.rotate.y);
	}

	if (options.image) {
		const image = new Image();
		image.src = await helper.getImage(options.image);
		drawImage(
			ctx,
			image,
			helper.def(template.boxImage, template.box),
			{ mode: options.mode });
	} else {
		const color = template.font.color;
		if (color && !tinycolor(color).isValid()) {
			throw new Error(`Template font color ${color} isn't valid`);
		}
		ctx.fillStyle = helper.def(color, '#000');
		ctx.font = `${template.font.size}px ${template.font.family}`;
		drawText(
			ctx,
			options.text,
			helper.def(template.boxText, template.box),
			{ offsetY: template.font.size });
	}

	ctx.restore(); // Restore the context's state

	if (template.mask) {
		ctx.globalCompositeOperation = 'destination-in';
		const mask = new Image();
		mask.src = await asyncReadFile(template.mask);
		ctx.drawImage(mask, 0, 0);
		ctx.globalCompositeOperation = 'source-over';
	}

	ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height); // Draw the full image on the canvas

	return canvas;
}

module.exports = compose;
