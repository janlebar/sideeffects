//addMedicine.tsx

import { useToast } from "@chakra-ui/react";
import { useState, FormEvent } from "react";
import { AddMedicineProps } from "@/app/types";
import { v4 as uuidv4 } from "uuid";
import { FiPlus } from "react-icons/fi";

const AddMedicine: React.FC<AddMedicineProps> = ({ addMedicine }) => {
  const toast = useToast();
  const [content, setContent] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({
        title: "No content",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    addMedicine({ id: uuidv4(), body: content.trim() });
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 sm:max-w-md"
    >
      <input
        placeholder="Add a medicine..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        <FiPlus /> Add
      </button>
    </form>
  );
};

export default AddMedicine;
