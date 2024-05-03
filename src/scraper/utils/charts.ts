/// <reference path="../../@types/global.d.ts" />
import 'dotenv/config';
import puppeteer, { Browser, Page } from 'puppeteer';

interface BenchmarkGraph {
    sessionIds: string[];
    graphType: string;
}

interface Section {
    title: string;
    layout: string;
    content: {
        benchmarkGraphs: BenchmarkGraph[];
        metadataAttributes: any[];
    };
    comments: string | null;
    assets: any[];
}

/**
 * Extracts performance hydration data from Next.js scripts on a page.
 * 
 * @param {Page} page - The Puppeteer Page instance.
 * @returns {Promise<any>} - Resolves to the performance data or null if not found.
 */
export async function extractPerformanceHydrationData(page: Page): Promise<any> {
    return await page.evaluate(() => {
        let performanceData;
        try {
            performanceData = self.__next_f
            .filter(item => item[0] === 1)  // Filter to types marked as '1'
            .map(item => item[1])           // Extract the data part of each item
            .join('')                       // Combine all items into a single string
            .split('\n')                    // Split into lines to process individual JSON objects
            .map(line => line.trim())       // Trim whitespace
            .filter(line => line)           // Remove empty lines
            .map(line => {
                const [key, ...valueParts] = line.split(':'); // Split line at the first colon to separate key from value
                const value = valueParts.join(':').trim();   // Rejoin value parts to preserve JSON structure
                try {
                    return JSON.parse(value);  // Parse the reconstructed JSON value
                } catch (error) {
                    return null;  // Ignore lines that do not contain valid JSON
                }
            })
            .find(parsed => Array.isArray(parsed) && parsed.length > 3 && parsed[2] === "performance");
        } catch (error) {
            console.log(performanceData);
            console.error('Error extracing hydration data:', error);
        }
        
        // Return the fourth element of the matched array if found
        return performanceData ? performanceData[3] : null;
    });
}

/**
 * Extracts the session ID for chart request from Next.js hydration data on a page.
 *
 * @param {Page} page - The Puppeteer Page instance.
 * @returns {Promise<string | null>} - A promise that resolves to the session ID needed for fetching the graph data,
 *                                     or null if no session ID is found.
 */
export async function extractPerformanceSessionId(page: Page, sectionTitle: string): Promise<string> {
    const performanceObject = await extractPerformanceHydrationData(page);

    // Check if the sections exist and contain the expected title
    let section: Section | undefined;
    try {
        section = performanceObject.category.sections.find((section: Section) => section.title === sectionTitle);
    } catch (error) {
        console.error(`Error getting session id for ${sectionTitle}:`, error);
    }

    if (section && section.content.benchmarkGraphs.length > 0) {
        const sessionIds = section.content.benchmarkGraphs[0].sessionIds;
        if (sessionIds && sessionIds.length > 0) {
            return sessionIds[0] as string; // Return the first session ID found
        }
    }

    throw new Error(`Session ID not found for ${sectionTitle}`);
}

/**
 * Gets the Cloudflare clearance cookie from the environment variables.
 * Necessary for requests to pages that are protected by Cloudflare.
 * 
 * @returns {string | undefined} The Cloudflare clearance cookie if set, otherwise undefined.
 */
function getCfClearance(): string | undefined {
    const cfClearance = process.env.CF_CLEARANCE;

    if (!cfClearance) {
        console.error('CF_CLEARANCE is not set in the environment variables.');
        return undefined;
    }

    return cfClearance;
}

/**
 * Fetches data from a single URL using Puppeteer with proper headers and cookies set.
 * Handles Cloudflare protection by checking page titles and throws if data cannot be fetched.
 * 
 * @param {Browser} browser - Puppeteer Browser instance.
 * @param {Page} refererPage - The referer page to mimic when making requests.
 * @param {string} url - The URL from which to fetch data.
 * @returns {Promise<any>} - A Promise that resolves to the JSON data fetched from the URL.
 */
async function fetchSingleUrl(browser: Browser, refererPage: Page, url: string): Promise<any> {
    const page = await browser.newPage();

    // Set cookies if cf_clearance is available
    const cfClearance = getCfClearance();
    if (cfClearance) {
        const cookies = [{
            'name': 'cf_clearance',
            'value': cfClearance,
            'domain': 'www.lttlabs.com',
            'path': '/',
            'httpOnly': true,
            'secure': true
        }];
        await page.setCookie(...cookies);
    } else {
        await page.close();
        throw new Error('Will not fetch chart data without cf_clearance.');
    }

    try {
        await page.setExtraHTTPHeaders({
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Pragma': 'no-cache',
            'Referer': refererPage.url(),
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Gpc': '1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        });

        await page.setViewport({ width: 1280, height: 620 });
        await page.setJavaScriptEnabled(true);
        const response = await page.goto(url, { waitUntil: 'networkidle0' });
        const pageTitle = await page.title();

        if (pageTitle.includes("Just a moment...")) {
            console.error(`Cloudflare protection detected on ${url}`);
            throw new Error("Cloudflare protection is active.");
        }

        const jsonData = await response?.json();

        if (!jsonData || jsonData.errors?.includes('Could not fetch game report data')) {
            throw new Error(`API Error: Could not fetch game report data for ${url}`);
        }

        return jsonData;
    } catch (error) {
        // If JSON parsing fails, handle the HTML content
        const content = await page.content();

        if (content.includes('<pre>')) {
            // Extract data from <pre> tag
            const data = await page.evaluate(() => {
                const pre = document.querySelector('pre');
                return pre ? pre.innerText : null;
            });
            if (data) {
                try {
                    const jsonData = JSON.parse(data);
                    return jsonData; // Return the parsed JSON from <pre>
                } catch (parseError) {
                    console.error('Failed to parse JSON from <pre> tag:', parseError);
                }
            }
        }
        
        console.error(`Failed to retrieve or parse JSON data for ${url}: ${error}`);
        throw error; // Re-throw to handle this error in higher order function calls
    } finally {
        await page.close();
    }
}

/**
 * Fetches JSON data from multiple URLs concurrently using Puppeteer.
 * Opens a new browser instance, fetches all URLs, then closes the browser.
 * 
 * @param {Page} refererPage - The referer page to mimic when making requests.
 * @param {string[]} urls - An array of URLs to fetch.
 * @returns {Promise<any[]>} - A Promise that resolves to an array of JSON data from each URL.
 */
export async function fetchJsonDataFromUrls(refererPage: Page, urls: string[]): Promise<any[]> {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-features=NetworkService', '--disable-features=IsolateOrigins,site-per-process']
    });

    try {
        // Process all URLs in parallel
        const results = await Promise.all(urls.map(url => fetchSingleUrl(browser, refererPage, url)));
        await browser.close();
        return results;
    } catch (error) {
        console.error(`Error during fetching/parsing multiple URLs: ${error}`);
        throw new Error(`Failed to fetch data from URLs: ${error}`);
    } finally {
        await browser.close();
    }
}

/**
 * Scrolls to the element specified by the selector.
 * @param {Page} page - The Puppeteer Page instance.
 * @param {string} selector - CSS selector of the element to scroll into view.
 * @returns {Promise<void>}
 */
async function scrollToElement(page: Page, selector: string): Promise<void> {
    const element = await page.$(selector);
    if (!element) {
        throw new Error(`Element with selector ${selector} not found or is not visible.`);
    }
    await page.evaluate(el => el.scrollIntoView(), element);
}

/**
 * Waits for a chart to load by attempting to scroll to the chart and find a specific element within it, or detects a message indicating data unavailability.
 * @param {Page} page - The Puppeteer Page instance.
 * @param {string} chartSelector - CSS selector for the chart container.
 * @param {number} maxAttempts - Maximum number of attempts to try loading the chart (default is 10).
 * @returns {Promise<string>} - Returns 0 if the chart loads successfully, 2 if the data is not available, or throws an error if neither condition is met after maximum attempts.
 */
export async function waitForChartToLoad(page: Page, chartSelector: string, timeout = 100, maxAttempts = 10): Promise<number> {
    const selector = `${chartSelector} .highcharts-series-0 > g.highcharts-data-label > text`;
    const unavailableSelector = `${chartSelector} div.bg-custom-chart-bg p`;
    let attempts = 0;
    while (attempts < maxAttempts) {
        await scrollToElement(page, chartSelector);
        try {
            await page.waitForSelector(selector, { visible: true, timeout });
            return 0; // If the selector is found and visible, exit the function
        } catch (error) {
            // Check if the unavailability message is visible instead
            const unavailableMessage = await page.$$eval(unavailableSelector, elements => 
                elements.map(element => element.textContent?.includes("Labs did not gather this data during the initial testing phase.")).includes(true)
            );
            if (unavailableMessage) {
                return 2; // If the data is confirmed not available, exit the function
            }
            attempts++;
            if (attempts === maxAttempts) {
                throw new Error(`Chart not found or is not visible after ${maxAttempts} attempts: ${error}`);
            }
        }
    }
    return 1; // If no errors and no data found, exit the function with an error code
}
