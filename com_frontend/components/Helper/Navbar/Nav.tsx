"use client";
import { Navlinks } from "@/constant/constant";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiBars3BottomRight } from "react-icons/hi2";
import { MdCameraAlt } from "react-icons/md";
import { NavProps } from "./Navbar.types";

const Nav = (props: NavProps) => {
  const [navBg, setNavBg] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (window.scrollY >= 90) {
        setNavBg(true);
      } else {
        setNavBg(false);
      }
    };

    window.addEventListener("scroll", handler);

    return () => {
      window.removeEventListener("scroll", handler);
    };
  }, []);

  return (
    <div
      className={`fixed w-full h-[10vh] z-[100] transition-all duration-200 ${
        navBg ? " shadow-md" : "bg-transparent"
      }`}
    >
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
          {Navlinks.map((li) => {
            return (
              <Link
                key={li.id}
                href={li.url}
                className="text-black hover:text-green-700 font-bold transition-all duration-200"
              >
                <p>{li.label}</p>
              </Link>
            );
          })}
        </div>
        {/* Admin button */}
        <div className=" flex items-center space-x-4">
          <button className="bg-blue-950 px-5 py-2.5 text-white font-bold rounded-lg hover:bg-black transition-all duration-300 cursor-pointer">
            Admin Dashborad
          </button>
          <HiBars3BottomRight
            onClick={props.openNav}
            className="w-8 h-8 cursor-pointer text-blue-950 lg:hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default Nav;
