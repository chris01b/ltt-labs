import { Page } from 'puppeteer';
import { getImagesData } from './utils';
import { InTheBox } from '../types';

/**
 * Extracts the in the box hardware from the specified webpage with the hardware box open
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The in the box hardware.
 */
export async function parseInTheBox(page: Page): Promise<InTheBox | null> {
    // In The Box
    try {
        const inTheBoxSelector = '#in-the-box';
        const sectionExists = await page.$(inTheBoxSelector) !== null;
        if (!sectionExists) {
            return null;
        }

        const images = await getImagesData(inTheBoxSelector);
        
        const itemsInTheBoxSelector = `${inTheBoxSelector} div.group.text-sm`;
        let itemsInTheBox: string[] | null = await page.$$eval(`${itemsInTheBoxSelector} > div > div`, divs => {
            const items = divs.map(div => div.textContent?.trim());
            // Filter out any items that are null or empty to ensure only valid strings are returned
            return items.filter(item => !!item).length > 0 ? items.filter(item => !!item) as string[] : null;
        });

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
