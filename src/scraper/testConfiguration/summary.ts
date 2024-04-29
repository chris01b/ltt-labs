import { Page } from 'puppeteer';
import { getSummaryData } from '../utils';

/**
 * Extracts the test configuration summary from the specified webpage after simulating a button click
 * that reveals the test configuration summary content.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The test configuration summary as a string if found, otherwise returns null.
 */
export async function parseSummary(page: Page): Promise<string | null> {
    try {
        const summarySelector = '#test-configuration .text-base.wysiwyg';
        const summary = getSummaryData(page, summarySelector);
        if (!summary) {
            console.error("Test Configuration summary content is empty or not found.");
            return null;
        }

        return summary;
    } catch (error) {
        console.error(`Error fetching test configuration summary: ${error}`);
        return null;
    }
}