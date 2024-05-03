interface Measurement {
    label: string;
    value: number;
}

export interface ComponentMeasurement {
    componentName: string;
    manufacturer: string;
    isReferenceComponent?: boolean;
    measurements: Measurement[];
}

export interface NonGameReport {
    xAxisLabel: string;
    measurementUnit: string;
    title: string;
    subtitle: string;
    componentMeasurements: ComponentMeasurement[];
}