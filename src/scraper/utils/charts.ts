import { Page } from 'puppeteer';
import { Game, Resolution } from '../types/gamingPerformance';

/**
 * Scrolls to the element specified by the selector.
 * @param {Page} page - The Puppeteer Page instance.
 * @param {string} selector - CSS selector of the element to scroll into view.
 * @returns {Promise<void>}
 */
async function scrollToElement(page: Page, selector: string): Promise<void> {
    const element = await page.$(selector);
    if (!element) {
        throw new Error(`Element with selector ${selector} not found or is not visible.`);
    }
    await page.evaluate(el => el.scrollIntoView(), element);
}

/**
 * Waits for a chart to load by attempting to scroll to the chart and find a specific element within it, or detects a message indicating data unavailability.
 * @param {Page} page - The Puppeteer Page instance.
 * @param {string} chartSelector - CSS selector for the chart container.
 * @param {number} maxAttempts - Maximum number of attempts to try loading the chart (default is 10).
 * @returns {Promise<string>} - Returns 0 if the chart loads successfully, 2 if the data is not available, or throws an error if neither condition is met after maximum attempts.
 */
export async function waitForChartToLoad(page: Page, chartSelector: string, timeout = 100, maxAttempts = 10): Promise<number> {
    const selector = `${chartSelector} .highcharts-series-0 > g.highcharts-data-label > text`;
    const unavailableSelector = `${chartSelector} div.bg-custom-chart-bg p`;
    let attempts = 0;
    while (attempts < maxAttempts) {
        await scrollToElement(page, chartSelector);
        try {
            await page.waitForSelector(selector, { visible: true, timeout });
            return 0; // If the selector is found and visible, exit the function
        } catch (error) {
            // Check if the unavailability message is visible instead
            const unavailableMessage = await page.$$eval(unavailableSelector, elements => 
                elements.map(element => element.textContent?.includes("Labs did not gather this data during the initial testing phase.")).includes(true)
            );
            if (unavailableMessage) {
                return 2; // If the data is confirmed not available, exit the function
            }
            attempts++;
            if (attempts === maxAttempts) {
                throw new Error(`Chart not found or is not visible after ${maxAttempts} attempts: ${error}`);
            }
        }
    }
    return 1; // If no errors and no data found, exit the function with an error code
}

type DropdownType = 'game' | 'resolution';

/**
 * Selects an item from a dropdown within the gaming performance section on the page. 
 * It handles both game and resolution dropdowns based on the specified type.
 * 
 * @param {Page} page - The Puppeteer Page object representing the browser page.
 * @param {DropdownType} dropdownType - Specifies the type of dropdown to interact with. Can be either 'game' or 'resolution'.
 * @param {Game | Resolution} selection - The item to select from the dropdown, which can be either a game or a resolution.
 * @throws {Error} Throws an error if the specified dropdown button or the desired selection is not found.
 * 
 * This function clicks on the specified dropdown button within the #gaming-performance section,
 * waits for the dropdown menu to become visible, and then selects the specified item.
 * The function utilizes indices to determine which dropdown button to click: '0' for games and '1' for resolutions.
 */
export async function selectFromDropdown(page: Page, dropdownType: DropdownType, selection: Game | Resolution): Promise<void> {
    // Define the base selector for dropdown buttons within the gaming-performance section
    const dropdownSelector = '#gaming-performance [id^="headlessui-popover-button-"]';
    const dropdownButtons = await page.$$(dropdownSelector);

    // Determine the index based on dropdownType
    const index = dropdownType === 'game' ? 0 : 1;

    // Check if the button at the desired index exists and click it
    if (dropdownButtons.length > index) {
        await dropdownButtons[index].click();
    } else {
        throw new Error(`${dropdownType} dropdown button not found.`);
    }

    // Wait for the corresponding dropdown panel to become visible
    const dropdownPanelSelector = `#gaming-performance [id^="headlessui-popover-panel-"]`;
    await page.waitForSelector(dropdownPanelSelector, { visible: true });

    // Click the button with the specific game or resolution name within the dropdown panel
    const itemSelector = `${dropdownPanelSelector} button[type="button"]`;
    await page.$$eval(itemSelector, (buttons, selection) => {
        const selectedItemButton = buttons.find(button => button.textContent?.trim() === selection);
        if (selectedItemButton) {
            selectedItemButton.click();
        } else {
            throw new Error(`Selection '${selection}' not found in dropdown.`);
        }
    }, selection.toString());
}