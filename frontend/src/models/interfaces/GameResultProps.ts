import { Country } from "@/models/Country";

export interface GameResultProps {
    gameState: "playing" | "won" | "lost";
    country: Country;
    cluesUsed: number;
    totalClues: number;
    gameMode?: "daily" | "infinite";
    onPlayAgain?: () => void;
    onClose: () => void;
}