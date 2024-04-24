import { Browser, Page } from 'puppeteer';
import { parseOverview } from '../src/scraper/gpuDetails/overview';
import { setupTestEnvironment, tearDownTestEnvironment } from './testSetup';

describe('GPU Overview Scraper', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        ({ browser, page } = await setupTestEnvironment('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb'));
    });

    afterAll(async () => {
        await tearDownTestEnvironment(browser);
    });

    it('should find the PRODUCT OVERVIEW section and extract text', async () => {
        const overviewText = await parseOverview(page);
        expect(overviewText).toBeTruthy();
        expect(typeof overviewText).toBe('string');
    });
});
