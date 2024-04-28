import { parseHardware } from '../src/scraper/hardware';
import { Hardware } from '../src/scraper/types';

describe('Hardware Scraper', () => {
    let page = global.page;

    describe('Valid GPU Article', () => {
        let hardware: Hardware | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
            hardware = await parseHardware(page);
        });

        it('should return an object of type Hardware', async () => {
            expect(hardware).toBeTruthy();
        });

        describe('Hardware Summary', () => {
            it('should correctly extract the hardware summary', async () => {
                const hardwareSummary = hardware?.summary;
                expect(hardwareSummary).toBeTruthy();
                expect(typeof hardwareSummary).toBe('string');
                expect(hardwareSummary).toContain('AD103');  // Check for specific expected content in the summary
            });
        });

        describe('In-The-Box Content', () => {
            it('should correctly extract images and box items', async () => {
                expect(hardware?.inTheBox).toHaveProperty('images');
                expect(hardware?.inTheBox).toHaveProperty('box');
                if (hardware?.inTheBox) {
                    expect(hardware?.inTheBox.images?.length).toEqual(4);
                    expect(hardware?.inTheBox.box?.length).toEqual(3);

                    const firstImage = hardware?.inTheBox?.images?.[0] ?? null;
                    expect(firstImage?.url).toMatch(/^http/);
                    expect(firstImage?.caption).toBeTruthy();
                }
            });
        });
    });

    describe('Invalid GPU Article', () => {
        let nullHardware: Hardware | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
            nullHardware = await parseHardware(page);
        });

        it('should handle the absence of the button or summary content gracefully', async () => {
            expect(nullHardware?.summary).toBeNull();
        });

        describe('In-The-Box Content when Missing', () => {
            it('should handle missing selectors gracefully', async () => {
                expect(nullHardware?.inTheBox).toBeNull();
            });
        });
    });
});
