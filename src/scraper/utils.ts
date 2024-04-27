import puppeteer, { Browser, Page } from 'puppeteer';

export async function initializePage(): Promise<{ browser: Browser; page: Page }> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    await page.setUserAgent(userAgent);
    await page.setJavaScriptEnabled(true);
    return { browser, page };
}
