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

        describe('Summary Content', () => {
            describe('Hardware Summary', () => {
                it('should correctly extract the hardware summary', async () => {
                    const hardwareSummary = hardware?.summary;
                    expect(hardwareSummary).toBeTruthy();
                    expect(typeof hardwareSummary).toBe('string');
                    expect(hardwareSummary).toContain('AD103');  // Check for specific expected content in the summary
                });
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

        describe('Graphics Processor Content', () => {
            it('should return an object of type GraphicsProcessor', () => {
                expect(hardware?.graphicsProcessor).toBeTruthy();
                expect(hardware?.graphicsProcessor).toBeInstanceOf(Object);
            });
    
            it('should correctly extract images', () => {
                expect(hardware?.graphicsProcessor?.images).toBeTruthy();
                expect(hardware?.graphicsProcessor?.images?.length).toBeGreaterThan(0);
                expect(hardware?.graphicsProcessor?.images?.[0]).toHaveProperty('url');
            });
    
            it('should correctly extract specifications', () => {
                expect(hardware?.graphicsProcessor).toHaveProperty('Architecture');
                expect(hardware?.graphicsProcessor).toHaveProperty('GPU Chip');
                expect(hardware?.graphicsProcessor?.['Architecture']).toEqual('Lovelace');
                expect(hardware?.graphicsProcessor?.['GPU Chip']).toEqual('AD103');
            });

            it('should find Nvidia GeForce RTX 4080 SUPER 16GB graphics processor note', () => {
                expect(hardware?.graphicsProcessor).toHaveProperty('note');
                expect(hardware?.graphicsProcessor?.note).toBeTruthy();
            });
        });

        describe('Cores & Clocks Content', () => {
            it('should correctly extract specifications', () => {
                expect(hardware?.coresAndClocks).toHaveProperty('Memory Type');
                expect(hardware?.coresAndClocks?.['Memory Type']).toEqual('GDDR6X');
            });
        });
    });

    describe('Invalid GPU Article', () => {
        let nullHardware: Hardware | null = null;

        beforeAll(async () => {
            await page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
            nullHardware = await parseHardware(page);
        });

        // Summary
        it('should handle the absence of the button or summary content gracefully', async () => {
            expect(nullHardware?.summary).toBeNull();
        });

        // In-The-Box
        it('should handle missing selectors gracefully', async () => {
            expect(nullHardware?.inTheBox).toBeNull();
        });

        // Graphics Processor
        it('should return null when graphics processor section is missing', () => {
            expect(nullHardware?.graphicsProcessor).toBeNull();
        });

        // Cores & Clocks
        it('should return null when cores & clocks section is missing', () => {
            expect(nullHardware?.coresAndClocks).toBeNull();
        });
    });
});
