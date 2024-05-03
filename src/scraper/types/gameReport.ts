export interface GameTestResult {
    component: string;
    manufacturer: string;
    average: number;
    p99: number;
    p95: number;
    p5: number;
    p1: number;
    min: number;
    max: number;
    settings: string;
    test: string;
    friendlyTest: string;
    friendlyResolution: string;
    friendlySettings: string;
}

export interface GameReport {
    baseTestResult: GameTestResult[];
    additionalTestResults?: GameTestResult[]; // TODO: Filter out
}