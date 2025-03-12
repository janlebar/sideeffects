//medicineList.tsx

import React from "react";
import {
  HStack,
  VStack,
  Text,
  IconButton,
  StackDivider,
  Spacer,
  Badge,
} from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { MedicineListProps } from "../../types";

const MedicineList: React.FC<MedicineListProps> = ({
  medicine,
  deleteMedicine,
}) => {
  if (!medicine.length) {
    return (
      <Badge p="4" m="4" borderRadius="lg">
        No Medicine added!
      </Badge>
    );
  }

  return (
    <VStack
      divider={<StackDivider />}
      borderColor="gray.100"
      borderWidth="2px"
      p="4"
      borderRadius="lg"
      w="100%"
      maxW={{ base: "90vw", sm: "80vw", lg: "50vw", xl: "40vw" }}
      alignItems="stretch"
    >
      {medicine.map((medicine) => (
        <HStack key={medicine.id}>
          <Text>{medicine.body}</Text>
          <Spacer />
          <IconButton
            icon={<FaTrash />}
            isRound={true}
            aria-label="Delete Todo"
            onClick={() => deleteMedicine(medicine.id)}
          />
        </HStack>
      ))}
    </VStack>
  );
};

export default MedicineList;
