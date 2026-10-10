//medicineList.tsx

import React from "react";
import { FaTimes } from "react-icons/fa";
import { MedicineListProps } from "../../types";

const MedicineList: React.FC<MedicineListProps> = ({
  medicine,
  deleteMedicine,
}) => {
  if (!medicine.length) {
    return (
      <p className="text-sm text-slate-400">No medicines added yet.</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {medicine.map((item) => (
        <li
          key={item.id}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 capitalize"
        >
          {item.body}
          <button
            type="button"
            aria-label={`Delete ${item.body}`}
            onClick={() => deleteMedicine(item.id)}
            className="text-slate-400 transition hover:text-red-500"
          >
            <FaTimes className="text-xs" />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default MedicineList;
