import { Browser, Page } from 'puppeteer';
import { parseArticleInfo } from '../src/scraper/gpuDetails/articleInfo';
import { setupTestEnvironment, tearDownTestEnvironment } from './testSetup';

describe('Article Info Scraper', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        // Adjust the URL to point to the article you expect to have the required elements
        ({ browser, page } = await setupTestEnvironment('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb'));
    });

    afterAll(async () => {
        await tearDownTestEnvironment(browser);
    });

    it('should extract the article title correctly', async () => {
        const articleInfo = await parseArticleInfo(page);
        expect(articleInfo.title).toBeTruthy();
        expect(articleInfo.title).toMatch('Nvidia GeForce RTX 4080 SUPER 16GB');
    });

    it('should extract the author and be properly formatted', async () => {
        const articleInfo = await parseArticleInfo(page);
        expect(articleInfo.author).toBeTruthy();
        expect(articleInfo.author).not.toContain('-');
    });

    it('should extract the tested by information and be non-empty', async () => {
        const articleInfo = await parseArticleInfo(page);
        expect(articleInfo.testedBy).toBeTruthy();
        expect(articleInfo.testedBy).not.toContain('-');
    });

    it('should extract the published date correctly', async () => {
        const articleInfo = await parseArticleInfo(page);
        expect(articleInfo.published).toBeTruthy();
        expect(articleInfo.published).toMatch(/\d{2}\s\w+\s\d{4}/);
    });

    it('should handle missing data fields gracefully', async () => {
        await page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle0' });
        const articleInfo = await parseArticleInfo(page);
        expect(articleInfo.author).toBeNull();
        expect(articleInfo.testedBy).toBeNull();
        expect(articleInfo.published).toBeNull();
    });
});
