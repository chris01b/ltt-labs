import { Browser, Page } from 'puppeteer';
import { fetchHTML, initializeBrowser } from '../src/scraper/utils';
import { parseWhatYouNeedToKnow } from '../src/scraper/gpuDetails/whatYouNeedToKnow';

describe('What You Need to Know Section Scraper', () => {
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

    it('should extract non-empty lists for good, bad, and other points', async () => {
        const whatYouNeedToKnowData = await parseWhatYouNeedToKnow(page);
        expect(whatYouNeedToKnowData.goodPoints).toBeDefined();
        expect(whatYouNeedToKnowData.goodPoints?.length).toBeGreaterThan(0);
        expect(whatYouNeedToKnowData.badPoints).toBeDefined();
        expect(whatYouNeedToKnowData.badPoints?.length).toBeGreaterThan(0);
        expect(whatYouNeedToKnowData.otherPoints).toBeDefined();
        expect(whatYouNeedToKnowData.otherPoints?.length).toBeGreaterThan(0);
    });

    it('should format the points correctly with titles and descriptions', async () => {
        const whatYouNeedToKnowData = await parseWhatYouNeedToKnow(page);
        whatYouNeedToKnowData.goodPoints?.forEach(point => {
            expect(point).toMatch(/^.+: .+$/);
        });
    });
});
