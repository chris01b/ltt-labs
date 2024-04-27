import { parseHardware } from '../src/scraper/hardware';
import { Hardware } from '../src/scraper/types';

describe('Hardware Scraper', () => {
    let hardware: Hardware | null = null;

    beforeAll(async () => {
        await global.page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
        hardware = await parseHardware(global.page);
    });

    it('should return an object of type Hardware', async () => {
        expect(hardware).toBeTruthy(); // Ensure that the hardware object is not null
    });

    describe('Hardware Summary', () => {
        it('should correctly extract the hardware summary', async () => {
            const hardwareSummary = hardware?.summary;
            expect(hardwareSummary).toBeTruthy();
            expect(typeof hardwareSummary).toBe('string');
            expect(hardwareSummary).toContain('AD103');  // Check for specific expected content in the summary
        });

        it('should handle the absence of the button or summary content gracefully', async () => {
            await global.page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
            const nullHardware = await parseHardware(global.page);
            expect(nullHardware?.summary).toBeNull();
        });
    });
});