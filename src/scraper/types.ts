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
    hardwareSummary: string;
    inTheBox: { images: string[], items: string[] };
    graphicsProcessorSpecs: Record<string, string>;
    coresAndClocks: Record<string, string>;
    boardDesignSpecs: Record<string, string>;
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
