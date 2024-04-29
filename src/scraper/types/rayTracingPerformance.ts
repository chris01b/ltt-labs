// Enum for the list of games
enum Game {
    Overall = "Overall",
    Cyberpunk2077 = "Cyberpunk 2077",
    F123 = "F1 23",
    Returnal = "Returnal",
}

// Enum for the list of resolutions
enum Resolution {
    R1440 = 1440
}

// Interface for the FPS data points
interface DataPoint {
    averageFPS: number;
    onePercentLowFPS: number;
}

// Interface for performance data for a specific game and resolution
export interface RayTracingPerformanceTestData {
    game: Game;
    resolution: Resolution;
    fpsData: DataPoint;
}
