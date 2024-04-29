import { Page } from 'puppeteer';
import { getSummaryData } from '../utils';

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
        const summarySelector = '#hardware-summary .text-base.wysiwyg';
        const hardwareSummary = getSummaryData(page, summarySelector);
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
