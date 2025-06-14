import React, { useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./components/Home/HomePage";
import NotFound from "./components/NotFound/NotFound";
import Sidebar from "./components/Sidebar/Sidebar";
import PiggyBank from "./components/Balance/Balance";
import Contact from "./components/Contacts/Contacts";
import { AuthContext, UserContext } from "./utils";
import Login from "./components/Login/Login";
import ProtectedRoute from "./components/Protected/ProtectedRoute";
import SignedLayout from "./components/SignedLayout/SignedLayout";
import Credit from "./components/Credit/Credit";
import FinancePlanner from "./components/FinancePlanner/FinancePlanner";
import FinanceSplit from "./components/FinanceSplit/FinanceSplit";
import Kids from "./components/Kids/Kids";
// import SignedHomePage from "./components/SignedHomePage/SignedHomePage";

const App = () => {
  const authTokenRef = useRef(null);
  const [user, setUser] = useState(null);
  return (
    <Router>
    <AuthContext.Provider value={{authTokenRef}} >
      <UserContext.Provider value={{user,setUser}}>
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Layout />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/" element={<ProtectedRoute/>}>
              <Route path="/home" element={<SignedLayout/>} >
                <Route index path="/home" element={<PiggyBank/>}/>
                <Route path="kids" element={<Kids/>}/>
                <Route path="contacts" element={<Contact />}/>
                <Route path="credit" element={<Credit/>} />
                <Route path="planfinance" element={<FinancePlanner/>}/>
                <Route path="splitfinance" element={<FinanceSplit/>}/>
              </Route>
            </Route>
          </Routes>
      </UserContext.Provider>
      </AuthContext.Provider>
    </Router>
  );
};

export default App;