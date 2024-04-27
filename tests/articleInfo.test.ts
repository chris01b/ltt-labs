import { parseArticleInfo } from '../src/scraper/gpuDetails/articleInfo';

describe('Article Info Scraper', () => {
    beforeAll(async () => {
        await global.page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
    });

    it('should extract the article title correctly', async () => {
        const articleInfo = await parseArticleInfo(global.page);
        expect(articleInfo.title).toBeTruthy();
        expect(articleInfo.title).toMatch('Nvidia GeForce RTX 4080 SUPER 16GB');
    });

    it('should extract the author and be properly formatted', async () => {
        const articleInfo = await parseArticleInfo(global.page);
        expect(articleInfo.author).toBeTruthy();
        expect(articleInfo.author).not.toContain('-');
    });

    it('should extract the tested by information and be non-empty', async () => {
        const articleInfo = await parseArticleInfo(global.page);
        expect(articleInfo.testedBy).toBeTruthy();
        expect(articleInfo.testedBy).not.toContain('-');
    });

    it('should extract the published date correctly', async () => {
        const articleInfo = await parseArticleInfo(global.page);
        expect(articleInfo.published).toBeTruthy();
        expect(articleInfo.published).toMatch(/\d{2}\s\w+\s\d{4}/);
    });

    it('should handle missing data fields gracefully', async () => {
        await global.page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
        const articleInfo = await parseArticleInfo(global.page);
        expect(articleInfo.author).toBeNull();
        expect(articleInfo.testedBy).toBeNull();
        expect(articleInfo.published).toBeNull();
    });
});
