import { CountryData } from "./CountryData";

export interface CountryEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    country: CountryData | null;
    onSave: (data: CountryData) => void;
}