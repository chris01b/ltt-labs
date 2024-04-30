import { Page } from 'puppeteer';

interface Section {
    title: string;
    layout: string;
    content: {
        benchmarkGraphs: BenchmarkGraph[];
        metadataAttributes: any[]; // Adjust this type according to the actual structure
    };
    comments: string | null;
    assets: any[]; // Adjust this type according to the actual structure
}

interface BenchmarkGraph {
    sessionIds: string[];
    graphType: string;
}

interface Category {
    title: string;
    includedSectionTitles: string[];
    sections: Section[];
}

interface PerformanceData {
    id: string;
    index: number;
    category: Category;
    reviewType: string;
}

/**
 * Extracts the session ID for the Gaming Performance graphs from a script element on the page.
 * 
 * @param {Page} page - The Puppeteer Page instance.
 * @returns {Promise<string>} - A promise that resolves to the session ID needed for fetching the graph data.
 */
export async function extractGamingPerformanceSessionId(page: Page): Promise<string> {
    const scriptContent = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        const performanceScripts = scripts.filter(script => script.textContent && script.textContent.includes('self.__next_f.push(') && script.textContent.includes('Gaming Performance'));

        if (!performanceScripts[1] || !performanceScripts[1].textContent) {
            throw new Error('Second Gaming Performance script not found.');
        }

        const match = /self\.__next_f\.push\(\[(.*?)]\)/s.exec(performanceScripts[1].textContent);
        if (!match || match.length < 2) {
            throw new Error('Unable to extract JSON data from script.');
        }

        // Extract the JSON string, handle escaping and clean up
        const rawJsonData = match[1].replace(/^[^,]*,/, ''); // Removes everything before the first comma
        const cleanedJson = rawJsonData
            .replace(/^\"\d*:/, '') // Remove leading digits and colon
            .replace(/\\n/g, '\n') // Remove all escaped newlines
            .replace(/\\"/g, '"') // Unescape double quotes
            .split('\n')[0]; // Keep only the first line of the JSON

        return cleanedJson;
    });

    // Parse the cleaned JSON string to an object and extract the session ID
    const jsonData: PerformanceData = JSON.parse(scriptContent)[3];
    const gamingPerformanceSection = jsonData.category.sections.find((section: Section) => section.title === 'Gaming Performance');
    const sessionId = gamingPerformanceSection?.content.benchmarkGraphs[0].sessionIds[0];

    if (!sessionId) {
        throw new Error('Session ID for Gaming Performance not found.');
    }

    return sessionId;
}
