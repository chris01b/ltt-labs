import { parseHardwareSummary } from '../src/scraper/hardware/hardwareSummary';

describe('Hardware Summary Scraper', () => {
    it('should correctly extract the hardware summary', async () => {
        await global.page.goto('https://www.lttlabs.com/articles/gpu/nvidia-geforce-rtx-4080-super-16gb', { waitUntil: 'networkidle2' });
        const hardwareSummary = await parseHardwareSummary(global.page);
        expect(hardwareSummary).toBeTruthy();
        expect(typeof hardwareSummary).toBe('string');
        expect(hardwareSummary).toContain('AD103');  // Check for specific expected content in the summary
    });

    it('should handle the absence of the button or summary content gracefully', async () => {
        await global.page.goto('https://www.lttlabs.com/articles/gpu/invalid-gpu', { waitUntil: 'networkidle2' });
        const hardwareSummary = await parseHardwareSummary(global.page);
        expect(hardwareSummary).toBeNull();
    });
});