import puppeteer, { Browser, Page, HTTPResponse } from 'puppeteer';

describe('GPU Scraper', () => {
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

    it('should load the website without receiving a 403/404/500 error', async () => {
        const response = await loadPage('https://www.lttlabs.com/categories/graphics-cards');
        expect(response?.status()).toBeLessThan(400);
    });

    it('should find elements with the testid "article-card"', async () => {
        await loadPage('https://www.lttlabs.com/categories/graphics-cards');
        const elements = await page.$$('a[data-testid="article-card"]');
        expect(elements.length).toBeGreaterThan(0); // Correct usage of Jest's matchers for length checking
    });

    it('should ensure that each "article-card" has a non-empty aria-label', async () => {
        await loadPage('https://www.lttlabs.com/categories/graphics-cards');
        const elements = await page.$$('a[data-testid="article-card"]');
        for (const element of elements) {
            const label = await element.evaluate((el: Element) => el.getAttribute('aria-label'));
            expect(label).toBeTruthy(); // Ensures the aria-label is non-null and non-empty
        }
    });
});
