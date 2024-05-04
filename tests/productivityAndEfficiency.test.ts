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

        it('should filter out non-reference components', async () => {
            const hasNonReferenceComponents = productivityAndEfficiencyData?.productivityTasks?.some(report =>
                report.componentMeasurements.some(component => !component.isReferenceComponent)
            );
            expect(hasNonReferenceComponents).toBeFalsy();
        });

        describe('Productivity Content', () => {
            it('should correctly extract productivity data for a known test', async () => {
                // Find a productivity task that has a measurement labeled "barbershop"
                const barbershopTask = productivityAndEfficiencyData?.productivityTasks?.find(task =>
                    task.componentMeasurements.some(cm => 
                        cm.measurements.some(measurement => measurement.label === "barbershop")
                    )
                );
        
                // Check that such a task was found
                expect(barbershopTask).toBeDefined();
        
                // If found, further validate that this task is for "NVIDIA GeForce RTX 4080 SUPER"
                if (barbershopTask) {
                    const nvidiaComponent = barbershopTask.componentMeasurements.find(cm => cm.componentName === "NVIDIA GeForce RTX 4080 SUPER");
                    expect(nvidiaComponent).toBeDefined();
        
                    // Validate that the component is a reference component
                    expect(nvidiaComponent?.isReferenceComponent).toBe(true);
        
                    // Validate that the specific measurement "barbershop" has the correct value
                    const barbershopMeasurement = nvidiaComponent?.measurements.find(m => m.label === "barbershop");
                    expect(barbershopMeasurement).toBeDefined();
                    expect(barbershopMeasurement?.value).toBe(65.92);
                }
            });
        });

        describe('Synthetic Benchmarks Content', () => {
            it('should correctly extract synthetic benchmark data', async () => {
                // Find a synthetic score that has a measurement labeled "PortRoyal"
                const portRoyalTask = productivityAndEfficiencyData?.syntheticScores?.find(score =>
                    score.componentMeasurements.some(cm =>
                        cm.measurements.some(measurement => measurement.label === "PortRoyal")
                    )
                );
        
                // Check that such a task was found
                expect(portRoyalTask).toBeDefined();
        
                // If found, further validate that this score is for "NVIDIA GeForce RTX 4080 SUPER"
                if (portRoyalTask) {
                    const nvidiaComponent = portRoyalTask.componentMeasurements.find(cm => cm.componentName === "NVIDIA GeForce RTX 4080 SUPER");
                    expect(nvidiaComponent).toBeDefined();
        
                    // Validate that the component is a reference component
                    expect(nvidiaComponent?.isReferenceComponent).toBe(true);
        
                    // Validate that the specific measurement "PortRoyal" has the correct value
                    const portRoyalMeasurement = nvidiaComponent?.measurements.find(m => m.label === "PortRoyal");
                    expect(portRoyalMeasurement).toBeDefined();
                    expect(portRoyalMeasurement?.value).toBe(18225);
                }
            });
        });
    });

    describe('Invalid Data Article', () => {
        let nullData: ProductivityAndEfficiency | null = null;

        beforeAll(async () => {
            const invalidPage = await browser.newPage();
            const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
            await invalidPage.setUserAgent(userAgent);
            await invalidPage.setJavaScriptEnabled(true);
            await invalidPage.goto('https://www.lttlabs.com/articles/gpu/invalid-data', { waitUntil: 'networkidle2' });
            nullData = await parseProductivityAndEfficiency(invalidPage);
        });

        // it('should handle the absence of data gracefully', async () => {
        //     // Check that the returned structure is not null
        //     expect(nullData).not.toBeNull();
    
        //     // Check that each data array within the structure is either empty or properly defined as null
        //     expect(nullData?.productivityTasks).toBeInstanceOf(Array);
        //     expect(nullData?.productivityTasks?.length).toBe(0);
        //     expect(nullData?.syntheticScores).toBeInstanceOf(Array);
        //     expect(nullData?.syntheticScores?.length).toBe(0);
        // });
    });
});
