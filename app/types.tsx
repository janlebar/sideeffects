import { IconType } from "react-icons";

export interface Medicine {
  id: string;
  body: string;
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
