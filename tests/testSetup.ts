import puppeteer, { Browser, Page } from 'puppeteer';
import { fetchHTML } from '../src/scraper/utils';

export async function setupTestEnvironment(url: string): Promise<{browser: Browser, page: Page}> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const content = await fetchHTML(url);
    await page.setContent(content);
    return { browser, page };
}

export async function tearDownTestEnvironment(browser: Browser): Promise<void> {
    await browser.close();
}
