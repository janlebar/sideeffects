import React from "react";
import { Input, Box } from "@chakra-ui/react";

interface SearchBarProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
  return (
    <Box
      w="100%"
      maxW={{ base: "90vw", sm: "80vw", lg: "50vw", xl: "40vw" }}
      mb={4}
    >
      <Input
        placeholder="Search todos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        variant="filled"
      />
    </Box>
  );
};

export default SearchBar;
