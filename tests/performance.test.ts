import { parsePerformance } from '../src/scraper/performance';
import { parseGamingPerformance } from '../src/scraper/performance/gamingPerformance';
import { Performance } from '../src/scraper/types';
import { Game } from '../src/scraper/types/gamingPerformance';

describe('Performance Scraper', () => {
    let page = global.page;

    describe('Valid GPU Article', () => {
        let performance: Performance | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
            performance = await parsePerformance(page);
        });

        it('should return an object', async () => {
            expect(Performance).toBeTruthy();
        });

        describe('Summary Content', () => {
            describe('Performance Summary', () => {
                it('should correctly extract the performance summary', async () => {
                    const performanceSummary = performance?.summary;
                    expect(performanceSummary).toBeTruthy();
                    expect(typeof performanceSummary).toBe('string');
                    expect(performanceSummary).toContain('RTX 4080');  // Check for specific expected content in the summary
                });
            });
        });

        describe('Gaming Performance Content', () => {
            it('should correctly extract the performance summary', async () => {
                const gamingPerformance = await parseGamingPerformance(page, 'GeForce RTX 4080 SUPER', Game.Overall);
                expect(gamingPerformance).toBeTruthy();
            });
        });
    });

    describe('Invalid GPU Article', () => {
        let nullPerformance: Performance | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
            nullPerformance = await parsePerformance(page);
        });

        // Summary
        it('should handle the absence of the button or summary content gracefully', async () => {
            expect(nullPerformance?.summary).toBeNull();
        });
    });
});
