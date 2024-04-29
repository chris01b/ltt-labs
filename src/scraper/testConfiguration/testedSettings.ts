import { Page } from 'puppeteer';
import { getTitledParagraphsData } from '../utils';
import { TestedSettings } from '../types';

/**
 * Extracts the test configuration tested settings from the specified webpage after simulating a button click
 * that reveals the test configuration testedSettings content.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The test configuration tested settings as TestedSettings if found, otherwise returns null.
 */
export async function parseTestedSettings(page: Page): Promise<TestedSettings | null> {
    try {
        const testedSettingsSelector = '#tested-settings .group.text-sm';
        const testedSettings = getTitledParagraphsData(page, testedSettingsSelector);
        if (!testedSettings) {
            console.error("Performance testedSettings content is empty or not found.");
            return null;
        }

        return testedSettings;
    } catch (error) {
        console.error(`Error fetching performance testedSettings: ${error}`);
        return null;
    }
}
