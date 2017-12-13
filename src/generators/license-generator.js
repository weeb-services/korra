async function generate(browser, url) {
    let page = await browser.newPage();
    page.setViewport({width: 812, height: 540});
    await page.goto(url, {waitUntil: 'load'});
    let image = await page.screenshot();
    await page.close();
    return image;
}

module.exports.generate = async function (browser, url) {
    return generate(browser, url);
};
