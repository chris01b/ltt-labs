import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';

/**
 * Initializes a browser session with a specific user agent, and returns the browser and page objects.
 * This function is typically used to set up a Puppeteer environment for further navigation and interaction with web pages.
 *
 * @param {boolean} [headless=false] - Whether or not to open the browser in headless mode.
 * @returns {Promise<{browser: Browser; page: Page}>} An object containing the Puppeteer Browser and Page instances.
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
 * Extracts specifications from a page and returns them as a key-value object.
 *
 * @param {Page} page - The Puppeteer Page object used for the query.
 * @param {string} specsSelector - The CSS selector for the section from which to extract specifications.
 * @param {boolean} [containsLinks=false] - Whether the specifications might contain links.
 * @returns {Promise<{[key: string]: string}>} An object containing key-value pairs of specifications.
 */
export async function getSpecsObject(page: Page, specsSelector: string, containsLinks: boolean = false): Promise<{ [key: string]: string }> {
    return page.$$eval(specsSelector, (divs, containsLinks) => {
        const items: { [key: string]: string } = divs.reduce((acc: { [key: string]: string }, div) => {
            const keyNode = div.querySelector('div.font-semibold');
            const key = keyNode ? keyNode.textContent?.trim() : null;
            
            let value = '';
            if (containsLinks) {
                const linkElement = div.querySelector('a');
                value = linkElement?.textContent?.trim() ?? '';
                // Add link in parentheses if available
                // if (linkElement && linkElement.getAttribute('href')) {
                //     value += ` (${linkElement.getAttribute('href')})`;
                // }
            } else {
                const childNodes = Array.from(div.childNodes);
                childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        value += node.textContent?.trim();
                    }
                });
            }

            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});

        return items;
    }, containsLinks);
}

/**
 * Logs details of all elements matching a given selector on the page.
 * 
 * @param {Page} page - The Puppeteer Page object.
 * @param {string} selector - The CSS selector to match elements.
 */
async function logElementDetails(page: Page, selector: string) {
    const details = await page.evaluate(selector => {
        const elements = Array.from(document.querySelectorAll(selector));
        return elements.map((el, index) => ({
            index: index,
            html: el.outerHTML, // Gets the element's outer HTML
            text: el.textContent?.trim(), // Gets the text content of the element, trimmed of whitespace
            class: el.className, // Gets the class of the element
            id: el.id // Gets the ID of the element
        }));
    }, selector);

    console.log(`Details of elements matching '${selector}':`);
    details.forEach(detail => {
        console.log(`Index: ${detail.index}, HTML: ${detail.html}, Text: ${detail.text}, Class: ${detail.class}, ID: ${detail.id}`);
    });
}

/**
 * Attempts to expand a collapsible section on a webpage by clicking a specified button
 * and waiting for a content section to become visible. This function includes retries
 * and can optionally log each attempt. It is designed to handle scenarios where the section
 * might not immediately open, possibly due to needing to load additional content over the network.
 *
 * @param {Page} page - The Puppeteer Page object on which the function will operate.
 * @param {string} buttonSelector - The CSS selector for the button that needs to be clicked to expand the section.
 * @param {string} isOpenSelector - The CSS selector for the element that indicates the section has been expanded.
 * @param {string} sectionName - A human-readable name for the section, used in logging and error messages.
 * @param {boolean} [debug=false] - Flag to enable detailed logging of each operation step and failure, useful for debugging.
 * @param {number} [retries=3] - The maximum number of attempts to try expanding the section if not successful on the first try.
 * @param {number} [delay=1500] - The time in milliseconds to wait for the section to expand before considering the attempt as failed.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the section was successfully expanded, or `false` if all attempts failed.
 */
export async function expandSection(
    page: Page,
    buttonSelector: string,
    isOpenSelector: string,
    sectionName: string,
    debug: boolean = false,
    retries: number = 3,
    delay: number = 1500
): Promise<boolean> {
    const result = await page.evaluate((buttonSelector, isOpenSelector, sectionName, debug, retries, delay) => {
        return new Promise((resolve) => {
            const sleep = (time: number) => new Promise(res => setTimeout(res, time));

            const button = document.querySelector(buttonSelector) as HTMLElement;
            let isOpen = document.querySelector(isOpenSelector);

            if (isOpen) {
                debug && console.log(`${sectionName} is already open.`);
                resolve(true);
                return;
            }

            if (!button) {
                console.log(`Button to expand ${sectionName} not found.`);
                resolve(false);
                return;
            }

            const attemptToExpand = (attempt: number) => {
                if (attempt >= retries) {
                    console.log(`Failed to expand ${sectionName} after maximum retries.`);
                    resolve(false);
                    return;
                }

                button.click();
                debug && console.log(`Clicked ${sectionName} button on attempt ${attempt + 1}.`);

                sleep(delay).then(() => {
                    isOpen = document.querySelector(isOpenSelector);
                    if (isOpen) {
                        debug && console.log(`${sectionName} successfully expanded on attempt ${attempt + 1}.`);
                        resolve(true);
                    } else {
                        debug && console.log(`Attempt ${attempt + 1} to expand ${sectionName} failed, retrying...`);
                        attemptToExpand(attempt + 1);
                    }
                });
            };

            attemptToExpand(0);
        });
    }, buttonSelector, isOpenSelector, sectionName, debug, retries, delay);

    return result as boolean;
}

/**
 * Extracts structured information from titled paragraphs on a webpage.
 * Each title is followed by related content, which is collated and returned as an object.
 * Returns null if no valid elements are found.
 *
 * @param {Page} page - The Puppeteer Page object from which to fetch the data.
 * @param {string} sectionSelector - The CSS selector for the container of titled paragraphs.
 * @returns {Promise<{ [key: string]: any } | null>} An object with keys as titles and values as concatenated text content, or null if no elements match.
 */
export async function getTitledParagraphsData(page: Page, sectionSelector: string): Promise<{ [key: string]: any } | null> {
    return page.$$eval(sectionSelector, divs => {
        if (divs.length === 0) {
            return null; // Return null immediately if no divs are found
        }

        const data: { [key: string]: any } = divs.reduce((acc: { [key: string]: any }, div) => {
            // Extract the title from the first child assumed to be the title div
            const titleDiv = div.querySelector('div.font-semibold') || div.querySelector('div.inline-flex');
            const title = titleDiv ? titleDiv.textContent?.trim() : null;
            
            // Concatenate all text spans under the div following the title div
            const contentDiv = div.querySelector('div:nth-child(2)');
            let content = '';
            if (contentDiv) {
                const spans = contentDiv.querySelectorAll('span');
                spans.forEach(span => {
                    content += span.textContent?.trim() + ' ';
                });
                content = content.trim();  // Remove the extra space at the end
            }

            if (title && content) {
                acc[title] = content;
            }
            return acc;
        }, {});

        return Object.keys(data).length > 0 ? data : null;  // Check if the object is empty and return null if so
    });
}
