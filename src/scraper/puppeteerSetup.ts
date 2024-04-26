import puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';

let browser: Browser | null = null;
let page: Page | null = null;

export async function setupPuppeteer(): Promise<{ browser: Browser; page: Page }> {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    await page.setUserAgent(userAgent);
    await page.setJavaScriptEnabled(true);
    return { browser, page };
}

export async function getPage() {
    if (!page) {
        throw new Error('Page not initialized, call setupPuppeteer first.');
    }
    return page;
}

export async function closePuppeteer(): Promise<void> {
    if (browser) {
        await browser.close();
        browser = null;
        page = null;
    }
}

export async function resetPage(): Promise<void> {
    if (page) {
        await page.close();
        page = await browser!.newPage();
    }
}
