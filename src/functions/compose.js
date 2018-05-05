'use strict';

const tinycolor = require('tinycolor2');
const { createCanvas } = require('canvas');

const canvasify = require('./canvasify');
const drawText = require('./drawText');
const drawImage = require('./drawImage');

/**
 * Doin stuff
 *
 * @param {object} template The Template
 * @param {string|Buffer|HTMLCanvasElement|CanvasRenderingContext2D} template.image The template image that should be used
 * @param {{x: number, y: number, w: number, h: number}=} template.box The fallback position on the template where the text or image should be drawn
 * @param {{x: number, y: number, w: number, h: number}=} template.boxText The position on the template where the text should be drawn
 * @param {{x: number, y: number, w: number, h: number}=} template.boxImage The position on the template where the image should be drawn
 * @param {{x: number, y: number, angle: number}=} template.rotate The rotation of the image or text that should be drawn
 * @param {{family: string, size: number, vs: number, hs: number, color: string|object}=} template.font The font definition for the text that should be drawn
 * @param {(string|object)=} template.bgColor The background color
 * @param {(string|Buffer|HTMLCanvasElement|CanvasRenderingContext2D)=} template.mask A mask that should be applied on the created context to cut it in shape
 * @param {object} options The options
 * @param {string|object=} options.image The image that should be drawn under the template
 * @param {string=} options.text The text that should be drawn under the template. This will only happen if no image is provided
 * @param {string=} options.mode The image placing mode. See drawImage for all modes
 */
async function compose(template, options) {
	// Load base image, this is the image that gets rendered on top of everything at the end
	// This should be a transparent image that has an empty area somewhere
	const baseCanvas = await canvasify(template.image);

	// Create a canvas with the same size where we can draw all the stuff on that goes behind the template image
	const canvas = createCanvas(baseCanvas.width, baseCanvas.height);
	const ctx = canvas.getContext('2d');

	// Apply the background color for the cutout area if present
	if (template.bgColor) {
		if (tinycolor(template.bgColor).isValid()) {
			ctx.fillStyle = template.bgColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		} else {
			throw new Error(`Background color ${template.bgColor} isn't valid`);
		}
	}

	if (options.image) {
		// Draw the image
		await drawImage({
			on: ctx,
			image: options.image,
			box: template.boxImage || template.box,
			mode: options.mode,
			rotate: template.rotate,
		});
	} else {
		// Draw the text
		await drawText({
			on: ctx,
			text: options.text,
			box: template.boxText || template.box,
			font: template.font,
			offset: {
				y: template.font.size,
			},
			rotate: template.rotate,
		});
	}

	// Apply mask if needed
	if (template.mask) {
		ctx.globalCompositeOperation = 'destination-in';
		const mask = await canvasify(template.mask);
		ctx.drawImage(mask, 0, 0);
		ctx.globalCompositeOperation = 'source-over';
	}

	// Draw the full image on the canvas
	ctx.drawImage(baseCanvas, 0, 0, baseCanvas.width, baseCanvas.height);

	return canvas;
}

module.exports = compose;
