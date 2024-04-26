import { parseOverview } from '../src/scraper/gpuDetails/overview';
import { setupPuppeteer, closePuppeteer, getPage } from '../src/scraper/puppeteerSetup';

describe('GPU Overview Scraper', () => {
    beforeAll(async () => {
        await setupPuppeteer();
        const page = await getPage();
        await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle0' });
    });

    afterAll(async () => {
        await closePuppeteer();
    });

    it('should find the PRODUCT OVERVIEW section and extract text', async () => {
        const page = await getPage();
        const overviewText = await parseOverview(page);
        expect(overviewText).toBeTruthy();
        expect(typeof overviewText).toBe('string');
    });
});
