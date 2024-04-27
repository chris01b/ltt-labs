import NodeEnvironment from 'jest-environment-node';
import puppeteer, { Browser, Page } from 'puppeteer';

// Configuring a new browser for each test suite is convenient for visually debugging
// but may not be the most efficient. Will consider use globalSetup and globalTeardown
class PuppeteerEnvironment extends NodeEnvironment {
    browser!: Browser;
    page!: Page;

    async setup() {
        await super.setup();
        this.browser = await puppeteer.launch({ headless: false });
        this.page = await this.browser.newPage();
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36';
        await this.page.setUserAgent(userAgent);
        await this.page.setJavaScriptEnabled(true);
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
