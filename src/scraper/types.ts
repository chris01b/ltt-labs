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
    oemTechnologies: oemTechnologies | null;
}

export interface SupportedFeatures {
    [key: string]: any;
}

export interface EncodeDecode {
    [key: string]: any;
}

type oemTechnologies = Array<string>;

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
    performance: {
        summary: string;
        gamingPerformance: Record<string, Record<string, string>>;
        rayTracingPerformance: Record<string, Record<string, string>>;
    };
    productivityAndEfficiency: {
        productivityTasks: Record<string, string>;
        syntheticScores: Record<string, string>;
    };
    testConfiguration: {
        summary: string;
        testBench: Record<string, string>;
        testedSettings: string;
    };
    [key: string]: any;
}
