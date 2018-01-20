const GenerationError = require('../structures/GenerationError');

async function generate(browser, url, viewport, imageUrls) {
    return new Promise(async(resolve, reject) => {
        let page = await browser.newPage();
        page.on('requestfailed', (req) => {
            return reject(new GenerationError('Failed to fetch image ' + req.url, req.url, 404));
        });
        page.on('requestfinished', (req) => {
            if (req._response) {
                if (imageUrls.find(iu => iu === req._response.url) && req._response.status > 399) {
                    return reject(new GenerationError('Failed to fetch image ' + req._response.url, req._response.url, req._response.status));
                }
            }
        });
        page.setViewport(viewport);
        await page.goto(url, {waitUntil: 'load'});
        let image = await page.screenshot();
        await page.close();
        page.removeAllListeners();
        return resolve(image);
    });

}

module.exports.generate = generate;
