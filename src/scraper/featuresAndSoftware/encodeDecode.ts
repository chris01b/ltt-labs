import { Page } from 'puppeteer';
import { getSpecsObject } from '../utils';
import { EncodeDecode } from '../types';

/**
 * Extracts the encode/decode features from the specified webpage with the features & software box open
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The encode/decode features data.
 */
export async function parseEncodeDecode(page: Page): Promise<EncodeDecode | null> {
    try {
        const encodeDecodeSelector = '#encode-decode';
        const sectionExists = await page.$(encodeDecodeSelector) !== null;
        if (!sectionExists) {
            console.error("Encode/Decode section not found.");
            return null;
        }
        
        const specsSelector = `${encodeDecodeSelector} div.group.text-sm`;
        const specs = await getSpecsObject(page, specsSelector);
        
        return specs;
    } catch (error) {
        console.error(`Error fetching encode/decode: ${error}`);
        return null;
    }
}
