import { Page } from 'puppeteer';
import { ProductivityAndEfficiency } from '../types';
import { NonGameReport, ComponentMeasurement } from '../types/nonGameReport';

export async function getProductivityAndEfficiencyData(page: Page, sessionIdsMap: Map<string, string[]>): Promise<ProductivityAndEfficiency> {
    let results: ProductivityAndEfficiency = {
        productivityTasks: [],
        syntheticScores: []
    };

    try {
        for (const [key, ids] of sessionIdsMap) {
            if (ids.length > 0) {
                const data = await page.evaluate(key => window[key], key);
                const parsedData = data.map((d: NonGameReport) => parseProductivityAndEfficiencyData(d)).flat();
                if (key === "Productivity") {
                    results.productivityTasks = parsedData;
                } else if (key === "Synthetics") {
                    results.syntheticScores = parsedData;
                }
            }
        }
        return results;
    } catch (error) {
        console.error(`Error processing productivity & efficiency data: ${error}`);
        throw new Error(`Data processing failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
}

function parseProductivityAndEfficiencyData(jsonData: NonGameReport): NonGameReport[] {
    const filteredComponentMeasurements: ComponentMeasurement[] = jsonData.componentMeasurements.filter(component => component.isReferenceComponent);
    if (filteredComponentMeasurements.length === 0) {
        return [];
    }
    const filteredReport: NonGameReport = {
        ...jsonData,
        componentMeasurements: filteredComponentMeasurements
    };
    return [filteredReport];
}
