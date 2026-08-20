import { LeaderboardEntry } from "./LeaderboardEntry";

export interface LeaderboardResponse {
    by_score: LeaderboardEntry[];
    by_streak: LeaderboardEntry[];
    user_score_entry?: LeaderboardEntry;
    user_streak_entry?: LeaderboardEntry;
}