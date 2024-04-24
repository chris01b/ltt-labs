import { Browser, Page } from 'puppeteer';
import { fetchHTML, initializeBrowser } from '../src/scraper/utils';
import { parseOverview } from '../src/scraper/gpuDetails/overview';

describe('GPU Overview Scraper', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        const content = await fetchHTML('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb');
        browser = await initializeBrowser();
        page = await browser.newPage();
        await page.setContent(content);
    });

    afterAll(async () => {
        await browser.close();
    });

    it('should find the PRODUCT OVERVIEW section and extract text', async () => {
        const overviewText = await parseOverview(page);
        expect(overviewText).toBeTruthy();
        expect(typeof overviewText).toBe('string');
    });
});
