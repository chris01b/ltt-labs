import { Page } from 'puppeteer';
import { getSpecsObject } from './utils';
import { CoresAndClocks } from '../types';

/**
 * Extracts the cores & clocks from the specified webpage with the hardware box open
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The graphics processor hardware.
 */
export async function parseCoresAndClocks(page: Page): Promise<CoresAndClocks | null> {
    try {
        const coresAndClocksSelector = '#cores-and-clocks';
        const sectionExists = await page.$(coresAndClocksSelector) !== null;
        if (!sectionExists) {
            return null;
        }
        
        const specsSelector = `${coresAndClocksSelector} div.group.text-sm`;
        const specs = await getSpecsObject(page, specsSelector);
        
        return specs;
    } catch (error) {
        console.error(`Error fetching cores & clocks: ${error}`);
        return null;
    }
}
