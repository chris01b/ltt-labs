import puppeteer, { Browser, Page } from 'puppeteer';

export async function initializePage(): Promise<{ browser: Browser; page: Page }> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    await page.setUserAgent(userAgent);
    await page.setJavaScriptEnabled(true);
    return { browser, page };
}

export async function getSummaryData(page: Page, selector: string): Promise<string | null> {
    const element = await page.$(selector);
    if  (!element) {
        return null;
    } else {
        return await element.evaluate(el => el.textContent?.trim() || null);
    }
}

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

export async function getSpecsList(page: Page, specsSelector: string): Promise<string[] | null> {
    return await page.$$eval(`${specsSelector} > div > div`, divs => {
        const items = divs.map(div => div.textContent?.trim());
        // Filter out any items that are null or empty to ensure only valid strings are returned
        return items.filter(item => !!item).length > 0 ? items.filter(item => !!item) as string[] : null;
    });
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

export async function expandSection(
    page: Page,
    buttonSelector: string,
    isOpenSelector: string,
    sectionName: string,
    retries: number = 3,
    delay: number = 1500, // Manual optimal timeout to wait for the section to expand
    debug: boolean = false
): Promise<boolean> {
    const button = await page.$(buttonSelector);
    let isOpen = await page.$(isOpenSelector);

    // If the section is already open, return true immediately
    // So far, no sections automatically open upon page load
    if (isOpen) {
        debug && console.log(`${sectionName} is already open.`);
        return true;
    }

    // If the button doesn't exist, log and return false
    // Shouldn't happen on any existing pages
    if (!button) {
        console.log(`Button to expand ${sectionName} not found.`);
        return false;
    }

    // Attempt to click the button and check the result
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            await button.click();
        } catch (error) {
            debug && console.log(`Failed to click ${sectionName} button on attempt ${attempt + 1}, retrying...`);
        }
        try {
            await page.waitForSelector(isOpenSelector, { timeout: delay });
            isOpen = await page.$(isOpenSelector);
            if (isOpen) {
                debug && console.log(`${sectionName} successfully expanded on attempt ${attempt + 1}.`);
                return true;
            }
        } catch (error) {
            debug && console.log(`Attempt ${attempt + 1} to expand ${sectionName} failed, retrying...`);
        }
    }

    // If all attempts fail
    console.log(`Failed to expand ${sectionName} after maximum retries.`);
    return false;
}
