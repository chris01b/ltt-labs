import { Page } from 'puppeteer';
import { getSummaryData } from '../utils';

/**
 * Extracts the features & software summary from the specified webpage after simulating a button click
 * that reveals the features & software summary content. Handles dynamic content with increased timeout
 * and additional diagnostics.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The features & software summary as a string if found, otherwise returns null.
 */
export async function parseSummary(page: Page): Promise<string | null> {
    try {
        const summarySelector = '#features-and-software .text-base.wysiwyg';
        const summary = getSummaryData(page, summarySelector);
        if (!summary) {
            console.error("Features & Software summary content is empty or not found.");
            return null;
        }

        return summary;
    } catch (error) {
        console.error(`Error fetching features & software summary: ${error}`);
        return null;
    }
}
