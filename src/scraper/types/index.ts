import { GameTestResult } from "./gameReport";
import { NonGameReport } from "./nonGameReport";

export interface GPUData {
    name: string;
    url: string;
}

export type LinkDetails = Record<string, string>; // TODO: Make this accurate

export interface ArticleInfo {
    title: string | null;
    author: string | null;
    testedBy: string | null;
    published: string | null;
}

export interface Hardware {
    summary: string | null;
    inTheBox: InTheBox | null;
    graphicsProcessor: GraphicsProcessor | null;
    coresAndClocks: CoresAndClocks | null;
    boardDesign: BoardDesign | null
}

export interface InTheBox {
    images: Array<{
        url: string | null;
        caption: string | null;
    }> | null;
    box: Array<string> | null;
}

export interface GraphicsProcessor {
    images: Array<{
        url: string | null;
        caption: string | null;
    }> | null;
    note?: string;
    [key: string]: any;
}

export interface CoresAndClocks {
    [key: string]: any;
}

export interface BoardDesign {
    images: Array<{
        url: string | null;
        caption: string | null;
    }> | null;
    [key: string]: any;
}

export interface FeaturesAndSoftware {
    summary: string | null;
    supportedFeatures: SupportedFeatures | null;
    encodeDecode: EncodeDecode | null;
    oemTechnologies: OemTechnologies | null;
}

export interface SupportedFeatures {
    [key: string]: any;
}

export interface EncodeDecode {
    [key: string]: any;
}

export type OemTechnologies = Array<string>;

export interface Performance {
    summary?: string | null;
    gamingPerformance: GameTestResult[] | null;
    rayTracingPerformance: GameTestResult[]| null;
}

export interface ProductivityAndEfficiency {
    productivityTasks: NonGameReport[] | null;
    syntheticScores: NonGameReport[] | null;
}

export interface TestConfiguration {
    summary: string | null;
    testBench: TestBench | null;
    testedSettings: TestedSettings | null;
}

export interface TestBench {
    [key: string]: any;
}

export interface TestedSettings {
    [key: string]: any;
}

export interface GPUProductDetails {
    name: string | null;
    author: string | null;
    testedBy: string | null;
    published: string | null;
    overview: string | null;
    goodPoints: string[] | undefined;
    badPoints: string[] | undefined;
    otherPoints: string[] | undefined;
    links: LinkDetails; // TODO: Make this accurate
    hardware: Hardware;
    featuresAndSoftware: FeaturesAndSoftware;
    performance: Performance;
    productivityAndEfficiency: ProductivityAndEfficiency | null;
    testConfiguration: TestConfiguration;
    [key: string]: any;
}
