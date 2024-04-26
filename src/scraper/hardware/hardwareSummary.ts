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
        const buttonSelector = '#hardware > div > button';

        await page.waitForSelector(buttonSelector, { visible: true, timeout: 60000 });
        const button = await page.$(buttonSelector);

        if (button) {
            await button.click();

            await page.waitForSelector('#hardware-summary .text-base', { timeout: 60000 });
        } else {
            console.error("Button to expand hardware summary not found.");
            return null;
        }

        // Check and retrieve the content
        const summaryElements = await page.$$('#hardware-summary .text-base');

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
