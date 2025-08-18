"use client";
import React, { useState } from "react";
import { SearchBarProps } from "./SearchBar.types";
import { Search } from "lucide-react";

const SearchBar: React.FC<SearchBarProps> = ({
  isShow,
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
}) => {
  const [internalValue, setInternalValue] = useState("");

  if (!isShow) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleSearch = () => {
    onSearch?.(value ?? internalValue);
  };

  return (
    <div>
      <div className="relative w-96">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          className="w-full pl-10 pr-3 py-2 border rounded-2xl focus:ring-2 focus:ring-blue-950 outline-none bg-white"
          placeholder={placeholder}
          value={value ?? internalValue}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
    </div>
  );
};

export default SearchBar;
