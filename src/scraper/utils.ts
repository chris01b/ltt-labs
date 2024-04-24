import puppeteer from 'puppeteer';

export async function initializeBrowser(headless: boolean = true) {
    return puppeteer.launch({ headless });
}

/**
 * Launches a Puppeteer browser instance and retrieves the full HTML content of the specified URL.
 * @param url The URL to fetch.
 * @returns The HTML content as a string.
 */
export async function fetchHTML(url: string, userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'): Promise<string> {
    const browser = await initializeBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    const response = await page.goto(url, { waitUntil: 'networkidle0' });

    if (!response) throw new Error('No response from the server.');
    if (response?.status() >= 400) {
        throw new Error(`Received a ${response.status()} error from the server.`);
    }

    const content = await page.content();
    await browser.close();
    return content;
}
