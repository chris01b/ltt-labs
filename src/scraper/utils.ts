import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * Initializes a browser session with a specific user agent, and returns the browser and page objects.
 * This function is typically used to set up a Puppeteer environment for further navigation and interaction with web pages.
 *
 * @param {boolean} [headless=false] - Whether or not to open the browser in headless mode.
 * @returns {Promise<{browser: Browser; page: Page}>} - An object containing the Puppeteer Browser and Page instances.
 */
export async function initializePage(headless: boolean = false): Promise<{ browser: Browser; page: Page }> {
    const browser = await puppeteer.launch({ headless });
    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    await page.setUserAgent(userAgent);
    await page.setJavaScriptEnabled(true);
    return { browser, page };
}

/**
 * Retrieves the text content from a specified selector on a webpage.
 * This function is designed to fetch and return textual data, like summaries or descriptions.
 *
 * @param {Page} page - The Puppeteer Page object from which to fetch the data.
 * @param {string} selector - The CSS selector used to locate the element.
 * @returns {Promise<string | null>} The text content of the selected element, or null if the element does not exist.
 */
export async function getSummaryData(page: Page, selector: string): Promise<string | null> {
    const element = await page.$(selector);
    if  (!element) {
        return null;
    } else {
        return await element.evaluate(el => el.textContent?.trim() || null);
    }
}

/**
 * Collects image URLs and captions from a specific section of a webpage.
 * This function is useful for scraping galleries or collections of images along with their accompanying text.
 *
 * @param {Page} page - The Puppeteer Page object used for the query.
 * @param {string} selector - The base CSS selector for the section containing images.
 * @returns {Promise<{url: string | null; caption: string | null}[]>} An array of objects each containing the URL and caption of an image.
 */
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

/**
 * Extracts a list of specifications or details from a specified section of a webpage.
 * This function returns a list of strings, each representing an individual specification or data point.
 *
 * @param {Page} page - The Puppeteer Page object used for the query.
 * @param {string} specsSelector - The CSS selector for the section containing specifications.
 * @returns {Promise<string[] | null>} An array of strings, each an individual specification; or null if no valid specifications are found.
 */
export async function getSpecsList(page: Page, specsSelector: string): Promise<string[] | null> {
    return await page.$$eval(`${specsSelector} > div > div`, divs => {
        const items = divs.map(div => div.textContent?.trim());
        // Filter out any items that are null or empty to ensure only valid strings are returned
        return items.filter(item => !!item).length > 0 ? items.filter(item => !!item) as string[] : null;
    });
}

/**
 * Extracts specifications and returns them as a key-value object.
 *
 * @param {Page} page - The Puppeteer Page object used for the query.
 * @param {string} specsSelector - The CSS selector for the section from which to extract specifications.
 * @returns {Promise<{[key: string]: string}>} An object containing key-value pairs of specifications.
 */
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

/**
 * Attempts to expand a collapsible section on a webpage by clicking a specified button and waiting for a content section to become visible. 
 * The function includes retries and can optionally log each attempt. It is designed to handle when the section might not 
 * immediately open due to needing to load table in some sections over the network before isOpenSelector appears.
 *
 * @param {Page} page - The Puppeteer Page object on which the function will operate.
 * @param {string} buttonSelector - The CSS selector for the button that needs to be clicked to expand the section.
 * @param {string} isOpenSelector - The CSS selector for the element that indicates the section has been expanded.
 * @param {string} sectionName - A human-readable name for the section, used in logging and error messages.
 * @param {number} [retries=3] - The maximum number of attempts to try expanding the section if not successful on the first try.
 * @param {number} [delay=1500] - The time in milliseconds to wait for the section to expand before considering the attempt as failed.
 * @param {boolean} [debug=false] - Flag to enable detailed logging of each operation step and failure, useful for debugging.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the section was successfully expanded, or `false` if all attempts failed.
 */
export async function expandSection(
    page: Page,
    buttonSelector: string,
    isOpenSelector: string,
    sectionName: string,
    retries: number = 3,
    delay: number = 1500,
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
