import React from "react";
import { Input } from "@chakra-ui/react";

interface SearchBarProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
  return (
    <Input
      placeholder="Search todos..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      mb={4}
      variant="filled"
    />
  );
};

export default SearchBar;
