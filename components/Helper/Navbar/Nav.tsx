"use client";
import SearchBar from "@/components/Common/NavSearch/SearchBar";
import { useEffect, useState } from "react";
import { HiBars3BottomRight } from "react-icons/hi2";
import { MdCameraAlt } from "react-icons/md";
import { NavProps } from "./Navbar.types";

const Nav = (props: NavProps) => {
  const [searchValue, setSearchValue] = useState("");

  console.log(searchValue);
  return (
    <div className={"w-full h-[12vh] transition-all duration-200 bg-gray-100"}>
      <div className="flex items-center h-full justify-between w-[90%] xl:w-[80%] mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-950 rounded-full flex items-center justify-center flex-col">
            <MdCameraAlt className="w-5 h-6 text-white" />
          </div>
          <h1 className="text-xl hidden sm:block md:text-2xl text-black font-bold">
            Sineth Studio
          </h1>
        </div>
        <div className=" hidden lg:flex items-center space-x-10">
          <SearchBar
            isShow={true}
            onSearch={(value) => setSearchValue(value)}
          />
        </div>
        {/* Admin button */}
        <div className=" flex items-center space-x-4">
          <HiBars3BottomRight
            onClick={props.openNav}
            className="w-8 h-8 cursor-pointer text-blue-950 "
          />
        </div>
      </div>
    </div>
  );
};

export default Nav;
