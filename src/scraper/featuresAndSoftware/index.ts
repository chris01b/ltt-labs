import { Page } from 'puppeteer';
import { parseSummary } from './summary';
import { parseSupportedFeatures } from './supportedFeatures';
import { parseEncodeDecode } from './encodeDecode';
import { parseOemTechnologies } from './oemTechnologies';
import { FeaturesAndSoftware } from '../types';

/**
 * Extracts the features & software from the specified webpage after simulating a button click
 * that reveals the features & software data. Handles dynamic content with increased timeout
 * and additional diagnostics.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The featuresAndSoftware data if found, otherwise returns null.
 */
export async function parseFeaturesAndSoftware(page: Page): Promise<FeaturesAndSoftware> {
    let featuresAndSoftware: FeaturesAndSoftware = {
        summary: null,
        supportedFeatures: null,
        encodeDecode: null,
        oemTechnologies: null
    }
    
    try {
        const buttonSelector = '#features-and-software > div > button';
        const isOpenSelector = '#features-software-summary';

        const button = await page.$(buttonSelector);
        const isOpen = await page.$(isOpenSelector);

        // Check if the summary is not already open
        if (!isOpen) {
            if (button) {
                await button.click();
                await page.waitForSelector(isOpenSelector, { timeout: 1000 });
            } else {
                console.log("Button to expand features & software not found.");
                return featuresAndSoftware; // Return null initialization if button not found
            }
        }

        const [summary, supportedFeatures, encodeDecode, oemTechnologies] = await Promise.all([
            parseSummary(page),
            parseSupportedFeatures(page),
            parseEncodeDecode(page),
            parseOemTechnologies(page)
        ]);

        return featuresAndSoftware = {
            summary,
            supportedFeatures,
            encodeDecode,
            oemTechnologies
        };
    } catch (error) {
        console.error(`Error fetching features & software summary: ${error}`);
        return featuresAndSoftware;
    }
}
