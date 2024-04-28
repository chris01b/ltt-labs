import { Page } from 'puppeteer';
import { InTheBox } from '../types';

/**
 * Extracts the hardware summary from the specified webpage after simulating a button click
 * that reveals the hardware summary content. Handles dynamic content with increased timeout
 * and additional diagnostics.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The hardware summary as a string if found, otherwise returns null.
 */
export async function parseInTheBox(page: Page): Promise<InTheBox | null> {
    try {
        const inTheBoxSelector = '#in-the-box';
        const sectionExists = await page.$(inTheBoxSelector) !== null;
        if (!sectionExists) {
            return null;
        }

        const imagesSelector = `${inTheBoxSelector} div[class*="MetadataSection_asset"] ul.slider`;
        const images = await page.$$eval(`${imagesSelector} li:not(:first-child):not(:last-child)`, lis => lis.map(li => ({
            url: li.querySelector('img')?.src || null,
            caption: li.querySelector('span')?.textContent?.trim() || null
        })));
        
        const itemsInTheBoxSelector = `${inTheBoxSelector} div.group.text-sm`;
        let itemsInTheBox: string[] | null = await page.$$eval(`${itemsInTheBoxSelector} > div > div`, divs => {
            // Map to strings, each div is treated as a separate item
            const items = divs.map(div => div.textContent?.trim());
            // Filter out any items that are null or empty to ensure only valid strings are returned
            return items.filter(item => !!item).length > 0 ? items.filter(item => !!item) as string[] : null;
        });

        if (itemsInTheBox === null) {
            const textContent = await page.$eval(itemsInTheBoxSelector, el => el.textContent?.trim() || null);
            itemsInTheBox = textContent !== null ? [textContent] : null;
        }
        
        

        return {
            images: images,
            box: itemsInTheBox
        };
    } catch (error) {
        console.error(`Error fetching hardware summary: ${error}`);
        return null;
    }
}
