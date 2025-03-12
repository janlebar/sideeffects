//addMedicine.tsx

import { Button, HStack, Input, useToast } from "@chakra-ui/react";
import { useState, FormEvent } from "react";
import { AddMedicineProps, Medicine } from "@/app/types";
import { v4 as uuidv4 } from "uuid";

const AddMedicine: React.FC<AddMedicineProps> = ({
  addMedicine: addMedicine,
}) => {
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

    const medicine: Medicine = {
      id: uuidv4(), // Generates a unique ID
      body: content,
    };

    addMedicine(medicine);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <HStack className="mt-8 border-2 border-gray-100 p-4 rounded-lg w-full max-w-[90vw] sm:max-w-[80vw] lg:max-w-[50vw] xl:max-w-[40vw] flex flex-col">
        <Input
          variant="filled"
          placeholder="Add a Medicine"
          value={content}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setContent(e.target.value)
          }
        />
        <Button px="8" type="submit">
          Add Medicine
        </Button>
      </HStack>
    </form>
  );
};

export default AddMedicine;
