import { parseHardwareSummary } from '../src/scraper/hardware/hardwareSummary';
import { setupPuppeteer, closePuppeteer, getPage } from '../src/scraper/puppeteerSetup';

describe('Hardware Summary Scraper', () => {
    beforeAll(async () => {
        await setupPuppeteer();
        const page = await getPage();
        await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle0' });
    });

    afterAll(async () => {
        await closePuppeteer();
    });

    it('should correctly extract the hardware summary', async () => {
        const page = await getPage();
        await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle0' });
        const hardwareSummary = await parseHardwareSummary(page);
        expect(hardwareSummary).toBeTruthy();
        expect(typeof hardwareSummary).toBe('string');
        expect(hardwareSummary).toContain('AD103');  // Check for specific expected content in the summary
    });

    it('should handle the absence of the button or summary content gracefully', async () => {
        const page = await getPage();
        await page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle0' });
        const hardwareSummary = await parseHardwareSummary(page);
        expect(hardwareSummary).toBeNull();
    });
});