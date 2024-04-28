import { ElementHandle, Page } from 'puppeteer';

export async function getImagesData(page: Page, selector: string): Promise<{
    url: string | null;
    caption: string | null;
}[]> {
    const imagesSelector = `${selector} div[class*="MetadataSection_asset"] ul.slider`;
    return await page.$$eval(`${imagesSelector} li:not(:first-child):not(:last-child)`, lis => lis.map(li => ({
        url: li.querySelector('img')?.src || null,
        caption: li.querySelector('span')?.textContent?.trim() || null
    })));
}

export async function getSpecsObject(page: Page, specsSelector: string): Promise<{ [key: string]: string }> {
    return await page.$$eval(specsSelector, divs => {
        const items: { [key: string]: string } = divs.reduce((acc: { [key: string]: string }, div) => {
            // Getting the key from the first child div
            const keyNode = div.querySelector('div.font-semibold');
            const key = keyNode ? keyNode.textContent?.trim() : null;
    
            // Get all text nodes directly under the current div that are immediate siblings of the keyNode
            let value = '';
            const childNodes = Array.from(div.childNodes);
            childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    value += node.textContent?.trim();
                }
            });
    
            // Adding key-value pair to the accumulator
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});
        return items;
    });
}