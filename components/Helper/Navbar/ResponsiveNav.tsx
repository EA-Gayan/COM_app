"use client";
import React, { useState } from "react";
import Nav from "./Nav";
import MobileNav from "./MobileNav";

const ResponsiveNav = () => {
  const [showMobileNav, setShowNav] = useState(false);

  const openNavHandler = () => {
    setShowNav(true);
  };
  const closeNavHandler = () => {
    setShowNav(false);
  };

  return (
    <div>
      <Nav openNav={openNavHandler} />
      <MobileNav showNav={showMobileNav} closeNav={closeNavHandler} />
    </div>
  );
};

export default ResponsiveNav;
