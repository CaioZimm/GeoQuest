import { ClueData } from "./ClueData";

export interface CountryData {
    id?: number;
    name: string;
    code: string;
    continent: string;
    capital: string;
    population: number;
    area: number;
    clues: ClueData[];
}