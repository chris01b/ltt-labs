import { Page } from 'puppeteer';
import { getImagesData } from './utils';
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
        const specs = await page.$$eval(specsSelector, divs => {
            const items: { [key: string]: string } = divs.reduce((acc: { [key: string]: string }, div) => {
                // Getting the key from the first child div
                const keyNode = div.querySelector('div.font-semibold');
                const key = keyNode ? keyNode.textContent?.trim() : null;
        
                // Get all text nodes directly under the current div that are immediate siblings of the keyNode
                let value = '';
                const childNodes = Array.from(div.childNodes);
                childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        value += node.textContent?.trim();
                    }
                });
        
                // Adding key-value pair to the accumulator
                if (key && value) {
                    acc[key] = value;
                }
                return acc;
            }, {});
            return items;
        });

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
