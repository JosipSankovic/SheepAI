import React from "react";
import { Outlet } from "react-router-dom";
import BankFooter from "../Footer/Footer";
import Sidebar from "../Sidebar/SideBar";

const SignedLayout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main>{children || <Outlet />}</main>
      <BankFooter/>
    </div>
  );
};

export default SignedLayout;
