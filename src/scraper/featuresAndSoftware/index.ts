import { Page } from 'puppeteer';
import { parseSummary } from './summary';
import { parseSupportedFeatures } from './supportedFeatures';
import { parseEncodeDecode } from './encodeDecode';
import { parseOemTechnologies } from './oemTechnologies';
import { expandSection } from '../utils';
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

        const featuresAndSoftwareSectionName = "Features & Software";
        const result = await expandSection(page, buttonSelector, isOpenSelector, featuresAndSoftwareSectionName);

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
