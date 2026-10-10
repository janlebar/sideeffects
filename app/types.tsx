import { IconType } from "react-icons";

export interface Medicine {
  id: string;
  body: string;
  /** Optional dose, e.g. "500mg". Used by the schedule view. */
  dose?: string;
  /** Optional scheduled times in "HH:MM" format. Used by the schedule view. */
  times?: string[];
}

export interface MedicineListProps {
  medicine: Medicine[];
  deleteMedicine: (id: string) => void;
}

export interface AddMedicineProps {
  addMedicine: (medicine: Medicine) => void;
}

export interface MenuItemProps {
  icon: IconType;
  label: string;
  onClick: () => void;
  className?: string;
}

export interface MainComponentProps {
  medicines: Medicine[];
  setMedicines: React.Dispatch<React.SetStateAction<Medicine[]>>;
  section: string;
}

// Side-effect data returned by /api/side-effects (see lib/sideEffects).
export interface SideEffectEntry {
  frequency: string;
  percentage?: string;
  symptoms: string[];
}

export interface SideEffectCategory {
  category: string;
  effects: SideEffectEntry[];
}

export interface SideEffectsResult {
  medicine: string;
  source: "database" | "scraped" | "none";
  categories: SideEffectCategory[];
}
