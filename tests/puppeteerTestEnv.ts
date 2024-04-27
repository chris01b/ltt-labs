import NodeEnvironment from 'jest-environment-node';
import { Browser, Page } from 'puppeteer';
import { initializePage } from '../src/scraper/utils';

// Configuring a new browser for each test suite is convenient for visually debugging
// but may not be the most efficient. Will consider use globalSetup and globalTeardown
class PuppeteerEnvironment extends NodeEnvironment {
    browser!: Browser;
    page!: Page;

    async setup() {
        await super.setup();
        ({ browser: this.browser, page: this.page } = await initializePage());
        this.global.browser = this.browser;
        this.global.page = this.page;
    }

    async teardown() {
        await this.page.close();
        await this.browser.close();
        await super.teardown();
    }
}

export default PuppeteerEnvironment;
