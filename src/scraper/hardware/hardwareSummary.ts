import { Page } from 'puppeteer';

/**
 * Extracts the hardware summary from the specified webpage after simulating a button click
 * that reveals the hardware summary content. Handles dynamic content with increased timeout
 * and additional diagnostics.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The hardware summary as a string if found, otherwise returns null.
 */
export async function parseHardwareSummary(page: Page): Promise<string | null> {
    try {
        const summarySelector = '#hardware-summary .text-base';
        const summaryElements = await page.$$(summarySelector);

        if (summaryElements.length < 2) {
            console.error("Not enough elements found for hardware summary.");
            return null;
        }

        const hardwareSummary = await summaryElements[1].evaluate(el => el.textContent?.trim() || null);
        if (!hardwareSummary) {
            console.error("Hardware summary content is empty or not found.");
            return null;
        }

        return hardwareSummary;
    } catch (error) {
        console.error(`Error fetching hardware summary: ${error}`);
        return null;
    }
}
