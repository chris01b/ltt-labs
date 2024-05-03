import { parseProductivityAndEfficiency } from '../src/scraper/productivityAndEfficiency/';
import { ProductivityAndEfficiency } from '../src/scraper/types';

describe('Productivity and Efficiency Scraper', () => {
    let page = global.page;
    let browser = global.browser;

    describe('Valid Data Article', () => {
        let productivityAndEfficiencyData: ProductivityAndEfficiency | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
            productivityAndEfficiencyData = await parseProductivityAndEfficiency(page);
        });

        it('should return arrays', async () => {
            expect(productivityAndEfficiencyData?.productivityTasks).toBeInstanceOf(Array);
            expect(productivityAndEfficiencyData?.syntheticScores).toBeInstanceOf(Array);
        });

        it('should filter out non-reference components', async () => {
            const hasNonReferenceComponents = productivityAndEfficiencyData?.productivityTasks?.some(report =>
                report.componentMeasurements.some(component => !component.isReferenceComponent)
            );
            expect(hasNonReferenceComponents).toBeFalsy();
        });

        describe('Productivity Content', () => {
            it('should correctly extract productivity data for a known test', async () => {
                const exampleTest = productivityAndEfficiencyData?.productivityTasks?.[0]?.componentMeasurements.find(cm => cm.componentName === "NVIDIA GeForce RTX 4080 SUPER");
                expect(exampleTest).toBeDefined();
                expect(exampleTest?.measurements.length).toBeGreaterThan(0);
            });
        });

        describe('Synthetic Benchmarks Content', () => {
            it('should correctly extract synthetic benchmark data', async () => {
                const exampleTest = productivityAndEfficiencyData?.syntheticScores?.[0]?.componentMeasurements.find(cm => cm.componentName === "NVIDIA GeForce RTX 4080 SUPER");
                expect(exampleTest).toBeDefined();
                expect(exampleTest?.measurements.length).toBeGreaterThan(0);
            });
        });
    });

    // describe('Invalid Data Article', () => {
    //     let nullData: ProductivityAndEfficiency | null = null;

    //     beforeAll(async () => {
    //         const invalidPage = await browser.newPage();
    //         const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    //         await invalidPage.setUserAgent(userAgent);
    //         await invalidPage.setJavaScriptEnabled(true);
    //         await invalidPage.goto('https://www.lttlabs.com/articles/gpu/invalid-data', { waitUntil: 'networkidle2' });
    //         nullData = await parseProductivityAndEfficiency(invalidPage);
    //     });

    //     it('should handle the absence of data gracefully', async () => {
    //         expect(nullData?.[0]).toBeInstanceOf(Array);
    //         expect(nullData?.[0].length).toBe(0);
    //         expect(nullData?.[1]).toBeInstanceOf(Array);
    //         expect(nullData?.[1].length).toBe(0);
    //     });
    // });
});
