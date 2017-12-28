async function generate(browser, url, viewport) {
    let page = await browser.newPage();
    page.setViewport(viewport);
    await page.goto(url, {waitUntil: 'load'});
    let image = await page.screenshot();
    await page.close();
    return image;
}

module.exports.generate = generate;
