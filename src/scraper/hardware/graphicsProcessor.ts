import { Page } from 'puppeteer';
import { getImagesData, getSpecsObject } from './utils';
import { GraphicsProcessor } from '../types';

/**
 * Extracts the graphics processor hardware from the specified webpage with the hardware box open
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The graphics processor hardware.
 */
export async function parseGraphicsProcessor(page: Page): Promise<GraphicsProcessor | null> {
    try {
        const graphicsProcessorSelector = '#graphics-processor';
        const sectionExists = await page.$(graphicsProcessorSelector) !== null;
        if (!sectionExists) {
            return null;
        }

        const images = await getImagesData(page, graphicsProcessorSelector);
        
        const specsSelector = `${graphicsProcessorSelector} div.group.text-sm`;
        const specs = await getSpecsObject(page, specsSelector);

        const noteSelector = `${graphicsProcessorSelector} div.wysiwyg`;
        const note = await page.$(noteSelector);
        const noteText = await note?.evaluate(el => el.textContent?.trim() || null);
        if (noteText) {
            specs.note = noteText;
        }
        
        return {
            images: images,
            ...specs
        };
    } catch (error) {
        console.error(`Error fetching graphics processor hardware: ${error}`);
        return null;
    }
}
