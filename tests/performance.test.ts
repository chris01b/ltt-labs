import { parsePerformance } from '../src/scraper/performance';
import { Performance } from '../src/scraper/types';

describe('Performance Scraper', () => {
    let page = global.page;
    let browser = global.browser;

    describe('Valid GPU Article', () => {
        let performance: Performance | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
            performance = await parsePerformance(page);
        });

        it('should return an object', async () => {
            expect(performance).toBeTruthy();
        });

        describe('Summary Content', () => {
            it('should correctly extract the performance summary', async () => {
                const performanceSummary = performance?.summary;
                expect(performanceSummary).toBeTruthy();
                expect(typeof performanceSummary).toBe('string');
                expect(performanceSummary).toContain('RTX 4080');  // Check for specific expected content in the summary
            });
        });

        describe('Gaming Performance Content', () => {
            it('should correctly extract gaming performance data for Atomic Heart', async () => {
                const gamingPerformance = performance?.gamingPerformance?.flatMap(report => report.baseTestResult);
                const atomicHeartData = gamingPerformance?.find(data => data.friendlyTest === "Atomic Heart" && data.settings === "Games-2160");
        
                expect(atomicHeartData).toBeDefined();
                expect(atomicHeartData?.average).toEqual(91);
                expect(atomicHeartData?.p1).toEqual(79);
            });

            it('should correctly extract gaming performance data for Cyberpunk', async () => {
                const gamingPerformance = performance?.gamingPerformance?.flatMap(report => report.baseTestResult);
                const cyberpunkData = gamingPerformance?.find(data => data.friendlyTest === "Cyberpunk 2077" && data.settings === "Games-1440");
        
                expect(cyberpunkData).toBeDefined();
                expect(cyberpunkData?.average).toEqual(120);
                expect(cyberpunkData?.p1).toEqual(96);
            });
        });

        describe('Ray Tracing Performance Content', () => {
            it('should correctly extract ray tracing performance data for Cyberpunk', async () => {
                const rayTracingPerformance = performance?.rayTracingPerformance?.flatMap(report => report.baseTestResult);
                const f123Data = rayTracingPerformance?.find(data => data.friendlyTest === "F1 23" && data.settings === "Games-1440-Rt");
        
                expect(f123Data).toBeDefined();
                expect(f123Data?.average).toEqual(108);
                expect(f123Data?.p1).toEqual(97);
            });

            it('should correctly extract ray tracing performance data for Returnal', async () => {
                const rayTracingPerformance = performance?.rayTracingPerformance?.flatMap(report => report.baseTestResult);
                const returnalData = rayTracingPerformance?.find(data => data.friendlyTest === "Returnal" && data.settings === "Games-1440-Rt");
        
                expect(returnalData).toBeDefined();
                expect(returnalData?.average).toEqual(114);
                expect(returnalData?.p1).toEqual(85);
            });
        });
    });

    describe('Invalid GPU Article', () => {
        let nullPerformance: Performance | null = null;

        beforeAll(async () => {
            const invalidPage = await browser.newPage();
            await invalidPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36');
            await invalidPage.setJavaScriptEnabled(true);
            await invalidPage.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
            nullPerformance = await parsePerformance(invalidPage);
        });

        it('should handle the absence of the button or summary content gracefully', async () => {
            expect(nullPerformance?.summary).toBeNull();
        });
    });
});
