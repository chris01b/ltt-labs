import { parseTestConfiguration } from '../src/scraper/testConfiguration';
import { TestConfiguration } from '../src/scraper/types';

describe('Test Configuration Scraper', () => {
    let page = global.page;

    describe('Valid GPU Article', () => {
        let testConfiguration: TestConfiguration | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
            testConfiguration = await parseTestConfiguration(page);
        });

        it('should return an object', async () => {
            expect(testConfiguration).toBeTruthy();
        });

        describe('Summary Content', () => {
            describe('Test Configuration Summary', () => {
                it('should correctly extract the test configuration summary', async () => {
                    const testConfigurationSummary = testConfiguration?.summary;
                    expect(testConfigurationSummary).toBeTruthy();
                    expect(typeof testConfigurationSummary).toBe('string');
                    expect(testConfigurationSummary).toContain('drivers');  // Check for specific expected content in the summary
                });
            });
        });

        describe('Test Bench Content', () => {
            it('should correctly extract the setup', () => {
                expect(testConfiguration?.testBench).toHaveProperty('CPU');
                expect(testConfiguration?.testBench?.['CPU']).toEqual('AMD Ryzen 7 7800X3D');
            });
        });

        describe('Tested Settings Content', () => {
            describe('Test Configuration Tested Settings', () => {
                it('should correctly extract the test configuration tested settings', async () => {
                    expect(testConfiguration?.testedSettings).toHaveProperty('Drivers');
                    expect(testConfiguration?.testedSettings?.['Drivers']).toContain('AMD GPU 23.12.1');  // Check for specific expected content in the summary
                });
            });
        });
    });

    describe('Invalid GPU Article', () => {
        let nullTestConfiguration: TestConfiguration | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
            nullTestConfiguration = await parseTestConfiguration(page);
        });

        // Summary
        it('should handle the absence of the button or summary content gracefully', async () => {
            expect(nullTestConfiguration?.summary).toBeNull();
        });

        // Test Bench
        it('should return null when supported features section is missing', () => {
            expect(nullTestConfiguration?.testBench).toBeNull();
        });

        // Tested Settings
        it('should handle the absence of the button or summary content gracefully', async () => {
            expect(nullTestConfiguration?.testedSettings).toBeNull();
        });
    });
});
