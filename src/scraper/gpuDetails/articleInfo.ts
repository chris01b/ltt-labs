import { Page } from 'puppeteer';
import { ArticleInfo } from '../types';

/**
 * Fetches the article metadata from a page, including the title, author, tested by, and published date.
 * This function uses the relative position of elements to distinguish between author, tested by, and published date.
 *
 * @param page The Puppeteer Page object representing the currently loaded webpage.
 * @returns An object containing article metadata if found, otherwise returns null if any key information is missing.
 */
export async function parseArticleInfo(page: Page): Promise<ArticleInfo> {
    try {
        const titleElem = await page.$('h1[data-testid="article-title"]');
        // Early return if title is not found
        if (!titleElem) {
            return { title: null, author: null, testedBy: null, published: null };
        }

        const title = await titleElem.evaluate(el => el.textContent?.trim() || null);
        // Return if the title content is null
        if (!title) {
            return { title: null, author: null, testedBy: null, published: null };
        }

        const authorTestedBySelector = 'h1[data-testid="article-title"] + div > div:nth-child(1) span:nth-child(2)';
        const publishedSelector = 'h1[data-testid="article-title"] + div > div:nth-child(1) span:nth-child(2) + div button';

        // Collect all metadata elements using the same selector and differentiate by their order
        const metaDataElements = await page.$$eval(authorTestedBySelector, elements => {
            return elements.map(el => el.textContent?.trim());
        });

        // Destructure array to obtain individual values and clean them up
        const [author, testedBy, _] = metaDataElements.length >= 3 ? metaDataElements : [null, null, null];

        const cleanedAuthor = author ? author.replace('-', '').trim() : null;
        const cleanedTestedBy = testedBy ? testedBy.replace('-', '').trim() : null;

        // Fetch the correct published date from the sibling element of the span
        const published = await page.$eval(publishedSelector, el => el.textContent?.trim() ?? null);

        return { title, author: cleanedAuthor, testedBy: cleanedTestedBy, published };
    } catch (error) {
        console.error(`Error fetching article information: ${error}`);
        return { title: null, author: null, testedBy: null, published: null };
    }
}