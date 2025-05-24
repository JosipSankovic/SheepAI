import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./components/Home/HomePage";
import NotFound from "./components/NotFound/NotFound";
import Sidebar from "./components/Sidebar/SideBar";
import PiggyBank from "./components/Balance/Balance";
// import SignedHomePage from "./components/SignedHomePage/SignedHomePage";

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<PiggyBank />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
