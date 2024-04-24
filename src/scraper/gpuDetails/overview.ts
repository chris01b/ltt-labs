import { Page } from 'puppeteer';

/**
 * Parses the "Overview" section of a GPU details page. Specifically, it extracts text from paragraphs located 
 * in a specific structural location relative to a known header element.
 * This function utilizes Puppeteer's page context to execute a DOM evaluation for extracting combined text data.
 * 
 * @param page The Puppeteer page instance already loaded with the GPU details content.
 * @returns A string consolidating all paragraph texts, or null if no text is found or if paragraphs do not exist.
 */
export async function parseOverview(page: Page): Promise<string | null> {
    return page.evaluate(() => {
        const productOverviewHeader = document.querySelector('h2.text-3xl.font-extrabold.text-custom-category');
        const productOverviewContent = productOverviewHeader?.parentElement?.nextElementSibling?.children[0]?.children[1]?.children[0]?.children[0];

        // Check if the container for the overview content is properly located.
        if (!productOverviewContent) {
            return null;
        }

        const paragraphs = productOverviewContent.querySelectorAll('p');
        if (!paragraphs.length) {
            return null; // Return null if no paragraphs are found.
        }

        const overviewText = Array.from(paragraphs).map(p => p.textContent ? p.textContent.trim() : '').filter(text => text).join(' ');

        // Return the combined text if not empty, otherwise return null.
        return overviewText || null;
    });
}
