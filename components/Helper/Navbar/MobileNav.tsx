import { Navlinks } from "@/constant/constant";
import Link from "next/link";
import React from "react";
import { CgClose } from "react-icons/cg";
import { NavProps } from "./Navbar.types";

const MobileNav = (props: NavProps) => {
  const navOpen = props.showNav ? "translate-x-0" : "-translate-x-full";

  return (
    <div>
      <div
        className={`
          fixed top-0 left-0 h-full transform transition-all duration-500 ease-in-out z-[1050]
          ${navOpen}
          w-full sm:w-[60%] md:w-[40%] lg:w-[20%]
          bg-blue-950 text-white flex flex-col space-y-6 p-8
        `}
      >
        {/* Close button */}
        <CgClose
          onClick={props.closeNav}
          className="absolute top-4 right-4 sm:w-8 sm:h-8 w-6 h-6 cursor-pointer hover:scale-110 transition"
        />

        {/* Navigation Links */}
        <nav className="flex flex-col gap-6 mt-10">
          {Navlinks.map((li) => (
            <Link
              key={li.id}
              href={li.url}
              className="text-white text-lg sm:text-xl md:text-2xl border-b border-white pb-2 w-fit hover:text-blue-300 transition"
              onClick={props.closeNav} // Close nav when link clicked
            >
              {li.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;
