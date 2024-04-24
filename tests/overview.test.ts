import puppeteer, { Browser, Page, HTTPResponse } from 'puppeteer';
import { parseOverview } from '../src/scraper/gpuDetails/overview';

describe('GPU Overview Scraper', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36');
    });

    afterAll(async () => {
        await browser.close();
    });

    const loadPage = async (url: string): Promise<HTTPResponse | null> => {
        const response = await page.goto(url, { waitUntil: 'networkidle0' });
        if (!response) throw new Error('No response from the server.');
        return response;
    };

    it('should load the GPU details page without receiving a 403/404/500 error', async () => {
        const response = await loadPage('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb');
        expect(response?.status()).toBeLessThan(400);
    });

    it('should find the PRODUCT OVERVIEW section and extract text', async () => {
        await loadPage('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb');
        const overviewText = await parseOverview(page);
        expect(overviewText).toBeTruthy();
        expect(typeof overviewText).toBe('string');
    });
});
