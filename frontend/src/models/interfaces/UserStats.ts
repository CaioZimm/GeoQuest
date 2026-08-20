export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    count: number;
    achieved: boolean;
    tier?: string;
}

export interface UserStats {
    played: number;
    win_rate: number;
    current_streak: number;
    max_streak: number;
    avg_guesses: number;
    achievements?: Achievement[];
}