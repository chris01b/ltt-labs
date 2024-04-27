import { parseOverview } from '../src/scraper/gpuDetails/overview';

describe('GPU Overview Scraper', () => {
    beforeAll(async () => {
        await global.page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
    });

    it('should find the PRODUCT OVERVIEW section and extract text', async () => {
        const overviewText = await parseOverview(global.page);
        expect(overviewText).toBeTruthy();
        expect(typeof overviewText).toBe('string');
    });
});
