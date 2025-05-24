import React from "react";
import { Outlet } from "react-router-dom";
import BankFooter from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";
import HomePage from "../Home/HomePage";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main><HomePage/></main>
      <BankFooter/>
    </div>
  );
};

export default Layout;
