// Enum for the list of Renders
enum Render {
    Barbershop = "Blender Barbershop Render",
}

// Interface for the time data point(s)
interface DataPoint {
    time: number;
}

// Interface for performance data for a specific render
export interface ProductivityTestData {
    Render: Render;
    fpsData: DataPoint;
}
