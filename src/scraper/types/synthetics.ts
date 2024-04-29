// Enum for the list of benchmarks
enum Benchmark {
    MarkFireStrike = "3DMark Fire Strike",
    MarkPortRoyal = "3DMark Port Royal",
    MarkSolarBay = "3DMark Solar Bay",
    MarkTimeSpy = "3DMark Time Spy",
    GravityMarkDX11 = "GravityMark DX11",
    GravityMarkDX12 = "GravityMark DX12",
    GravityMarkOpenGL = "GravityMark OpenGL",
    GravityMarkVulkan = "GravityMark Vulkan",
    SuperpositionOpenGLExtreme = "Superposition OpenGL Extreme"
}

// Interface for the score data point(s)
interface DataPoint {
    Score: number;
}

// Interface for performance data for a specific benchmark
export interface BenchmarkTestData {
    Benchmark: Benchmark;
    fpsData: DataPoint;
}
