import { Browser, Page } from 'puppeteer';
import { parseHardwareSummary } from '../src/scraper/hardware/hardwareSummary';
import { setupTestEnvironment, tearDownTestEnvironment } from './testSetup';
import { initializePage } from '../src/scraper/utils';

describe('Hardware Summary Scraper', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        [browser, page] = await initializePage();
    });

    afterAll(async () => {
        await tearDownTestEnvironment(browser);
    });

    it('should correctly extract the hardware summary', async () => {
        await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle0' });
        const hardwareSummary = await parseHardwareSummary(page);
        expect(hardwareSummary).toBeTruthy();
        expect(typeof hardwareSummary).toBe('string');
        expect(hardwareSummary).toContain('AD103');  // Check for specific expected content in the summary
    });

    it('should handle the absence of the button or summary content gracefully', async () => {
        await page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle0' });
        const hardwareSummary = await parseHardwareSummary(page);
        expect(hardwareSummary).toBeNull();
    });
});