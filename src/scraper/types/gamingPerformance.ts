// Enum for the list of games
enum Game {
    Overall = "Overall",
    AtomicHeart = "Atomic Heart",
    Cyberpunk2077 = "Cyberpunk 2077",
    Dota2 = "Dota 2",
    F123 = "F1 23",
    RedDeadRedemption2 = "Red Dead Redemption 2",
    Returnal = "Returnal",
    RocketLeague = "Rocket League",
    TheLastOfUsPartI = "The Last of Us Part I"
}

// Enum for the list of resolutions
enum Resolution {
    R1080 = 1080,
    R1440 = 1440,
    R2160 = 2160
}

// Interface for the FPS data points
interface DataPoint {
    averageFPS: number;
    onePercentLowFPS: number;
}

// Interface for performance data for a specific game and resolution
export interface GamingPerformanceTestData {
    game: Game;
    resolution: Resolution;
    fpsData: DataPoint;
}
