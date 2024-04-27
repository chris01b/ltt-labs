import { Page } from 'puppeteer';
import { parseHardwareSummary } from './hardwareSummary';
import { Hardware } from '../types';

/**
 * Extracts the hardware summary from the specified webpage after simulating a button click
 * that reveals the hardware summary content. Handles dynamic content with increased timeout
 * and additional diagnostics.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The hardware summary as a string if found, otherwise returns null.
 */
export async function parseHardware(page: Page): Promise<Hardware> {
    let hardware: Hardware = { summary: null };
    try {
        const buttonSelector = '#hardware > div > button';
        const isOpenSelector = '#hardware-summary .text-base';

        const button = await page.$(buttonSelector);

        if (button) {
            await button.click();

            await page.waitForSelector(isOpenSelector, { timeout: 1000 });
        } else {
            console.log("Button to expand hardware summary not found.");
            return hardware; // return null initialization
        }

        const [summary] = await Promise.all([
            parseHardwareSummary(page)
        ]);

        return hardware = { summary };
    } catch (error) {
        console.error(`Error fetching hardware summary: ${error}`);
        return hardware;
    }
}