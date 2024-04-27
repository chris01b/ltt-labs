import puppeteer, { Browser, Page } from 'puppeteer';

export async function initializePage(): Promise<[Browser, Page]> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    await page.setUserAgent(userAgent);
    await page.setJavaScriptEnabled(true);
    return [browser, page];
}

/**
 * Launches a Puppeteer browser instance and retrieves the full HTML content of the specified URL.
 * @param url The URL to fetch.
 * @returns The HTML content as a string.
 */
export async function fetchHTML(url: string): Promise<string> {
    const [browser, page] = await initializePage();
    const response = await page.goto(url, { waitUntil: 'networkidle2' });

    if (!response) throw new Error('No response from the server.');
    if (response?.status() >= 400) {
        throw new Error(`Received a ${response.status()} error from the server.`);
    }

    const content = await page.content();
    await browser.close();
    return content;
}
