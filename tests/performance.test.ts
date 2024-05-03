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
            it('should correctly extract gaming performance data for Atomic Heart', async () => {
                const gamingPerformance = performance?.gamingPerformance;
                const atomicHeartData = gamingPerformance?.find(data => data.game === "Atomic Heart" && data.resolution === 2160);
        
                expect(atomicHeartData).toBeDefined();
                expect(atomicHeartData?.fpsData.averageFPS).toEqual(91);
                expect(atomicHeartData?.fpsData.onePercentLowFPS).toEqual(79);
            });

            it('should correctly extract gaming performance data for Cyberpunk', async () => {
                const gamingPerformance = performance?.gamingPerformance;
                const cyberpunkData1080 = gamingPerformance?.find(data => data.game === "Cyberpunk 2077" && data.resolution === 1080);
                const cyberpunkData2160 = gamingPerformance?.find(data => data.game === "Cyberpunk 2077" && data.resolution === 2160);
        
                expect(cyberpunkData1080).toBeDefined();
                expect(cyberpunkData1080?.fpsData.averageFPS).toEqual(181);
                expect(cyberpunkData2160?.fpsData.averageFPS).toEqual(54);
            });
        });

        describe('Ray Tracing Performance Content', () => {
            it('should correctly extract ray tracing performance data for Cyberpunk', async () => {
                const rayTracingPerformance = performance?.rayTracingPerformance;
                const cyberpunkData1440 = rayTracingPerformance?.find(data => data.game === "Cyberpunk 2077" && data.resolution === 1440);
        
                expect(cyberpunkData1440).toBeDefined();
                expect(cyberpunkData1440?.fpsData.averageFPS).toEqual(60);
            });

            it('should correctly extract ray tracing performance data for Returnal', async () => {
                const rayTracingPerformance = performance?.rayTracingPerformance;
                const returnalData1440 = rayTracingPerformance?.find(data => data.game === "Returnal" && data.resolution === 1440);
        
                expect(returnalData1440).toBeDefined();
                expect(returnalData1440?.fpsData.averageFPS).toEqual(114);
            });
        });
        
    });

    describe('Invalid GPU Article', () => {
        let nullPerformance: Performance | null = null;

        beforeAll(async () => {
            const invalidPage = await browser.newPage();
            const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
            await invalidPage.setUserAgent(userAgent);
            await invalidPage.setJavaScriptEnabled(true);
            await invalidPage.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
            nullPerformance = await parsePerformance(invalidPage);
        });

        // Summary
        it('should handle the absence of the button or summary content gracefully', async () => {
            expect(nullPerformance?.summary).toBeNull();
        });
    });
});
