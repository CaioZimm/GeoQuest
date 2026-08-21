export interface AdExtraHintProps {
    gameState: "playing" | "won" | "lost";
    cluesLength: number;
    extraHint: string | null;
    isWatchingAd: boolean;
    requestExtraHint: () => void;
}