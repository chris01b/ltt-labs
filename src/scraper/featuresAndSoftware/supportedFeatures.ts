import { Page } from 'puppeteer';
import { getSpecsObject } from '../utils';
import { SupportedFeatures } from '../types';

/**
 * Extracts the supported features from the specified webpage with the features & software box open
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The supported features data.
 */
export async function parseSupportedFeatures(page: Page): Promise<SupportedFeatures | null> {
    try {
        const supportedFeaturesSelector = '#supported-features';
        const sectionExists = await page.$(supportedFeaturesSelector) !== null;
        if (!sectionExists) {
            console.error("Supported Features section not found.");
            return null;
        }
        console.log("Supported Features section exists.");
        
        const specsSelector = `${supportedFeaturesSelector} div.group.text-sm`;
        const specs = await getSpecsObject(page, specsSelector);
        
        return specs;
    } catch (error) {
        console.error(`Error fetching supported features: ${error}`);
        return null;
    }
}
