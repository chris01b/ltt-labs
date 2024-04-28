import { Page } from 'puppeteer';
import { getImagesData, getSpecsList } from './utils';
import { InTheBox } from '../types';

/**
 * Extracts the in the box hardware from the specified webpage with the hardware box open
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The in the box hardware.
 */
export async function parseInTheBox(page: Page): Promise<InTheBox | null> {
    try {
        const inTheBoxSelector = '#in-the-box';
        const sectionExists = await page.$(inTheBoxSelector) !== null;
        if (!sectionExists) {
            return null;
        }

        const images = await getImagesData(page, inTheBoxSelector);
        
        const itemsInTheBoxSelector = `${inTheBoxSelector} div.group.text-sm`;
        let itemsInTheBox = await getSpecsList(page, itemsInTheBoxSelector);

        // When there is a singular item in the box, the HTML structure is different
        if (itemsInTheBox === null) {
            const textContent = await page.$eval(itemsInTheBoxSelector, el => el.textContent?.trim() || null);
            itemsInTheBox = textContent !== null ? [textContent] : null;
        }
        
        return {
            images: images,
            box: itemsInTheBox
        };
    } catch (error) {
        console.error(`Error fetching in the box hardware: ${error}`);
        return null;
    }
}
