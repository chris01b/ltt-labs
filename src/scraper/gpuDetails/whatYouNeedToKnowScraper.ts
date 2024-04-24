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

        const iconSelector = "div.flex.h-5.w-5.items-center.justify-center.rounded-full";
        const goodIcon = document.querySelector(`${iconSelector}.bg-green-500`);
        const badIcon = document.querySelector(`${iconSelector}.bg-red-500`);
        const restIcon = document.querySelector(`${iconSelector}.bg-neutral-400`);

        const goodContainer = goodIcon ? goodIcon.parentNode?.parentNode as HTMLElement : null;
        const badContainer = badIcon ? badIcon.parentNode?.parentNode as HTMLElement : null;
        const restContainer = restIcon ? restIcon.parentNode?.parentNode as HTMLElement : null;

        // Helper to extract points as string arrays.
        function extractPoints(container: HTMLElement | null): string[] {
            return container ? Array.from(container.querySelectorAll('ul li')).map(li => {
                const title = li.querySelector('span')?.textContent?.trim() || '';
                const description = li.querySelector('p')?.textContent?.trim() || '';
                return `${title}: ${description}`;
            }) : [];
        }

        details.goodPoints = extractPoints(goodContainer);
        details.badPoints = extractPoints(badContainer);
        details.otherPoints = extractPoints(restContainer);

        return details;
    });
}