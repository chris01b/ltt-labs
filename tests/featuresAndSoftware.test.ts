import { parseFeaturesAndSoftware } from '../src/scraper/featuresAndSoftware';
import { FeaturesAndSoftware } from '../src/scraper/types';

describe('featuresAndSoftware Scraper', () => {
    let page = global.page;

    describe('Valid GPU Article', () => {
        let featuresAndSoftware: FeaturesAndSoftware | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
            featuresAndSoftware = await parseFeaturesAndSoftware(page);
        });

        it('should return an object', async () => {
            expect(featuresAndSoftware).toBeTruthy();
        });

        describe('Summary Content', () => {
            describe('Features & Software Summary', () => {
                it('should correctly extract the features & software summary', async () => {
                    const featuresAndSoftwareSummary = featuresAndSoftware?.summary;
                    expect(featuresAndSoftwareSummary).toBeTruthy();
                    expect(typeof featuresAndSoftwareSummary).toBe('string');
                    expect(featuresAndSoftwareSummary).toContain('experience');  // Check for specific expected content in the summary
                });
            });
        });

        describe('Supported Features Content', () => {
            it('should correctly extract specifications', () => {
                expect(featuresAndSoftware?.supportedFeatures).toHaveProperty('Adaptive Sync');
                expect(featuresAndSoftware?.supportedFeatures?.['Adaptive Sync']).toEqual('G-Sync');
            });
        });

        describe('Encode/Decode Content', () => {
            it('should correctly extract specifications', () => {
                expect(featuresAndSoftware?.encodeDecode).toHaveProperty('VP9');
                expect(featuresAndSoftware?.encodeDecode?.['VP9']).toEqual('Yes');
            });
        });
    });

    describe('Invalid GPU Article', () => {
        let nullfeaturesAndSoftware: FeaturesAndSoftware | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
            nullfeaturesAndSoftware = await parseFeaturesAndSoftware(page);
        });

        // Summary
        it('should handle the absence of the button or summary content gracefully', async () => {
            expect(nullfeaturesAndSoftware?.summary).toBeNull();
        });

        // Supported Features
        it('should return null when supported features section is missing', () => {
            expect(nullfeaturesAndSoftware?.supportedFeatures).toBeNull();
        });

        // Encode/Decode
        it('should return null when encode/decode section is missing', () => {
            expect(nullfeaturesAndSoftware?.encodeDecode).toBeNull();
        });
    });
});
