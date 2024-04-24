import { Browser, Page } from 'puppeteer';
import { fetchHTML, initializeBrowser } from '../src/scraper/utils';

describe('GPU Scraper', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        const content = await fetchHTML('https://www.lttlabs.com/categories/graphics-cards');
        browser = await initializeBrowser();
        page = await browser.newPage();
        await page.setContent(content);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('should find elements with the testid "article-card"', async () => {
        const elements = await page.$$('a[data-testid="article-card"]');
        expect(elements.length).toBeGreaterThan(0); // Correct usage of Jest's matchers for length checking
    });

    it('should ensure that each "article-card" has a non-empty aria-label', async () => {
        const elements = await page.$$('a[data-testid="article-card"]');
        for (const element of elements) {
            const label = await element.evaluate((el: Element) => el.getAttribute('aria-label'));
            expect(label).toBeTruthy(); // Ensures the aria-label is non-null and non-empty
        }
    });
});
