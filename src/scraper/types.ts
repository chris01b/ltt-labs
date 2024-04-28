export interface GPUData {
    name: string;
    url: string;
}

export type LinkDetails = Record<string, string>;

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

export interface GPUProductDetails {
    name: string | null;
    author: string | null;
    testedBy: string | null;
    published: string | null;
    overview: string | null;
    goodPoints: string[] | undefined;
    badPoints: string[] | undefined;
    otherPoints: string[] | undefined;
    links: LinkDetails;
    hardwareSummary: string | null;
    inTheBox: InTheBox | null;
    graphicsProcessor: GraphicsProcessor | null;
    coresAndClocks: CoresAndClocks | null;
    boardDesign: BoardDesign | null;
    featuresAndSoftware: {
        summary: string;
        supportedFeatures: Record<string, string>;
        encodeDecode: Record<string, string>;
        oemTechnologies: string[];
    };
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
