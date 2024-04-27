describe('GPU Scraper', () => {
    beforeAll(async () => {
        await global.page.goto('https://www.lttlabs.com/categories/graphics-cards', { waitUntil: 'networkidle2' });
    });

    it('should find elements with the testid "article-card"', async () => {
        const elements = await global.page.$$('a[data-testid="article-card"]');
        expect(elements.length).toBeGreaterThan(0); // Correct usage of Jest's matchers for length checking
    });

    it('should ensure that each "article-card" has a non-empty aria-label', async () => {
        const elements = await global.page.$$('a[data-testid="article-card"]');
        for (const element of elements) {
            const label = await element.evaluate((el: Element) => el.getAttribute('aria-label'));
            expect(label).toBeTruthy(); // Ensures the aria-label is non-null and non-empty
        }
    });
});
