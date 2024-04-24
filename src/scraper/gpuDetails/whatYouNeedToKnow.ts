import { Page } from 'puppeteer';
import { GPUProductDetails } from '../types';

/**
 * Parses the "What you need to know" section of a GPU details page.
 * 
 * @param page The Puppeteer page instance already loaded with the GPU details content.
 * @returns An object containing arrays of good points, bad points, and other points.
 */
export async function parseWhatYouNeedToKnow(page: Page): Promise<Partial<GPUProductDetails>> {
    return page.evaluate(() => {
        const details: Partial<GPUProductDetails> = {
            goodPoints: [],
            badPoints: [],
            otherPoints: []
        };

        const categories = {
            'bg-green-500': 'goodPoints',
            'bg-red-500': 'badPoints',
            'bg-neutral-400': 'otherPoints'
        };

        Object.entries(categories).forEach(([color, key]) => {
            const iconSelector = `div.flex.h-5.w-5.items-center.justify-center.rounded-full.${color}`;
            const icon = document.querySelector(iconSelector);
            const container = icon ? icon.parentNode?.parentNode as HTMLElement : null;

            if (container) {
                details[key] = Array.from(container.querySelectorAll('ul li')).map(li => {
                    const title = li.querySelector('span')?.textContent?.trim() || '';
                    const description = li.querySelector('p')?.textContent?.trim() || '';
                    return `${title}: ${description}`;
                });
            }
        });

        return details;
    });
}