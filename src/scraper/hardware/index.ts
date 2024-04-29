import { Page } from 'puppeteer';
import { parseHardwareSummary } from './hardwareSummary';
import { parseInTheBox } from './inTheBox';
import { parseGraphicsProcessor } from './graphicsProcessor';
import { parseCoresAndClocks } from './coresAndClocks';
import { parseBoardDesign } from './boardDesign';
import { expandSection } from '../utils';
import { Hardware } from '../types';

/**
 * Extracts the hardware data from the specified webpage after simulating a button click
 * that reveals the hardware data. Handles dynamic content with increased timeout
 * and additional diagnostics.
 * 
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns The hardware data if found, otherwise returns null.
 */
export async function parseHardware(page: Page): Promise<Hardware> {
    let hardware: Hardware = {
        summary: null,
        inTheBox: null,
        graphicsProcessor: null,
        coresAndClocks: null,
        boardDesign: null,
    };
    
    try {
        const buttonSelector = '#hardware > div > button';
        const isOpenSelector = '#hardware-summary';

        const hardwareSectionName = "Hardware Section"; // Human-readable name for logging
        const result = await expandSection(page, buttonSelector, isOpenSelector, hardwareSectionName);

        const [summary, inTheBox, graphicsProcessor, coresAndClocks, boardDesign] = await Promise.all([
            parseHardwareSummary(page),
            parseInTheBox(page),
            parseGraphicsProcessor(page),
            parseCoresAndClocks(page),
            parseBoardDesign(page)
        ]);

        return hardware = { summary, inTheBox, graphicsProcessor, coresAndClocks, boardDesign };
    } catch (error) {
        console.error(`Error fetching hardware summary: ${error}`);
        return hardware;
    }
}
