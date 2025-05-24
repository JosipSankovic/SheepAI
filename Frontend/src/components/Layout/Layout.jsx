import React from "react";
import { Outlet } from "react-router-dom";
import BankFooter from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main>{children || <Outlet />}</main>
      <BankFooter/>
    </div>
  );
};

export default Layout;
