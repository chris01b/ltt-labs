import { Page } from 'puppeteer';
import { getSpecsList } from '../utils';
import { OemTechnologies } from '../types';

/**
 * Extracts the features & software OEM technologies from the specified webpage with the features & software box open
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The features & software OEM technologies.
 */
export async function parseOemTechnologies(page: Page): Promise<OemTechnologies | null> {
    try {
        const oemTechnologiesSelector = '#oem-technologies';
        const sectionExists = await page.$(oemTechnologiesSelector) !== null;
        if (!sectionExists) {
            return null;
        }
        
        const oemTechnologiesDataSelector = `${oemTechnologiesSelector} div.group.text-sm`;
        let oemTechnologiesData = await getSpecsList(page, oemTechnologiesDataSelector);
        
        return oemTechnologiesData;
    } catch (error) {
        console.error(`Error fetching features & software OEM technologies: ${error}`);
        return null;
    }
}
