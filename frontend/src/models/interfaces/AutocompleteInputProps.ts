export interface AutocompleteInputProps {
    guess: string;
    guessing: boolean;
    errorMsg: string;
    filteredCountries: string[];
    showAutocomplete: boolean;
    cluesLength: number;
    totalClues: number;
    setShowAutocomplete: (show: boolean) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectCountry: (selected: string) => void;
    handleGuess: (e: React.FormEvent) => void;
}