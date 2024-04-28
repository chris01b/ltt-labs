import { Page } from 'puppeteer';
import { getImagesData, getSpecsObject } from './utils';
import { GraphicsProcessor } from '../types';

/**
 * Extracts the board design hardware from the specified webpage with the hardware box open
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The board design hardware.
 */
export async function parseBoardDesign(page: Page): Promise<GraphicsProcessor | null> {
    try {
        const boardDesignSelector = '#board-design';
        const sectionExists = await page.$(boardDesignSelector) !== null;
        if (!sectionExists) {
            return null;
        }

        const images = await getImagesData(page, boardDesignSelector);
        
        const specsSelector = `${boardDesignSelector} div.group.text-sm`;
        const specs = await getSpecsObject(page, specsSelector);
        
        return {
            images: images,
            ...specs
        };
    } catch (error) {
        console.error(`Error fetching board design hardware: ${error}`);
        return null;
    }
}
