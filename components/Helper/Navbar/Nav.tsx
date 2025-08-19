"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { HiBars3BottomRight } from "react-icons/hi2";
import { MdCameraAlt } from "react-icons/md";
import { CgClose } from "react-icons/cg";
import Link from "next/link";
import { Navlinks } from "@/constant/constant";
import SearchBar from "@/components/Common/NavSearch/SearchBar";
import { NavProps } from "./Navbar.types";

const Nav = (types: NavProps) => {
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");
  const [showSideNav, setShowSideNav] = useState(false);

  return (
    <div className="w-full h-[12vh] transition-all duration-200 bg-gray-100 relative">
      {/* Top bar */}
      <div className="flex items-center h-full justify-between w-[90%] xl:w-[80%] mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-950 rounded-full flex items-center justify-center">
            <MdCameraAlt className="w-5 h-6 text-white" />
          </div>
          <h1 className="text-xl hidden sm:block md:text-2xl text-black font-bold">
            Sineth Studio
          </h1>
        </div>

        {types.showSearch && (
          <div className="hidden lg:flex items-center space-x-10">
            <SearchBar
              isShow={true}
              value={searchValue}
              onChange={(val) => {
                setSearchValue(val); // internal state
                types.onSearchChange?.(val); // notify parent
              }}
              onSearch={(val) => {
                setSearchValue(val);
                types.onSearchChange?.(val);
              }}
            />
          </div>
        )}

        {/* Hamburger Icon (mobile only) */}
        <div className="flex items-center space-x-4">
          <HiBars3BottomRight
            onClick={() => setShowSideNav(true)}
            className="w-8 h-8 cursor-pointer text-blue-950"
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {showSideNav && (
        <div
          className={`fixed top-0 left-0 h-full transform transition-all duration-500 ease-in-out z-[1050]
    ${showSideNav ? "translate-x-0" : "-translate-x-full"}
    w-full sm:w-[60%] md:w-[40%] lg:w-[20%]
    bg-blue-950 text-white flex flex-col space-y-6 p-8`}
        >
          {/* Close button */}
          <CgClose
            onClick={() => setShowSideNav(false)}
            className="absolute top-4 right-4 sm:w-8 sm:h-8 w-6 h-6 cursor-pointer hover:scale-110 transition"
          />

          {/* Navigation Links */}
          <nav className="flex flex-col gap-6 mt-10">
            {Navlinks.map((li) => (
              <Link
                key={li.id}
                href={li.url}
                className={`text-white text-lg sm:text-xl md:text-2xl border-b border-white pb-2 w-fit hover:text-blue-300 transition ${
                  pathname === li.url ? "text-blue-300 font-bold" : ""
                }`}
              >
                {li.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Nav;
