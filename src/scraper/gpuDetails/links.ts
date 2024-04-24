import { Page } from 'puppeteer';
import { LinkDetails } from '../types';  // Ensure LinkDetails is defined appropriately in your types module

/**
 * Parses the "Links" section of a GPU details page, specifically extracting URLs and titles from links labeled 'Buy it on'.
 * Utilizes Puppeteer's page context to execute a DOM evaluation for extracting link data.
 * 
 * @param page The Puppeteer page instance already loaded with the GPU details content.
 * @returns A dictionary object mapping each link title to its corresponding URL.
 */
export async function parseLinks(page: Page): Promise<LinkDetails> {
    return page.evaluate(() => {
        const linksDetails: LinkDetails = {};

        const linkElements = document.querySelectorAll('a[title*="Buy it on"]');

        linkElements.forEach(element => {
            const url = element.getAttribute('href');
            const img = element.querySelector('img');
            const title = img?.alt.trim()

            if (url && title) {
                linksDetails[title] = url;
            }
        });

        return linksDetails;
    });
}
