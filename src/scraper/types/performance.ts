export enum Game {
    Overall = "Overall",
    AtomicHeart = "Atomic Heart",
    Cyberpunk2077 = "Cyberpunk 2077",
    Dota2 = "DOTA 2",
    F123 = "F1 23",
    RedDeadRedemption2 = "Red Dead Redemption 2",
    Returnal = "Returnal",
    RocketLeague = "Rocket League",
    TheLastOfUsPartI = "The Last of Us Part I"
}

export enum Resolution {
    R1080 = 1080,
    R1440 = 1440,
    R2160 = 2160
}

export interface DataPoint {
    averageFPS: number;
    onePercentLowFPS: number;
    minFPS?: number;
    maxFPS?: number;
    percent99FPS?: number;
    percent95FPS?: number;
    percent5FPS?: number;
}

export interface PerformanceTestData {
    game: Game;
    resolution: Resolution;
    fpsData: DataPoint;
}