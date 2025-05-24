import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./components/Home/HomePage";
import NotFound from "./components/NotFound/NotFound";
import Sidebar from "./components/Sidebar/SideBar";
import PiggyBank from "./components/Balance/Balance";
import Contact from "./components/Contacts/Contacts";
// import SignedHomePage from "./components/SignedHomePage/SignedHomePage";

const App = () => {
  const authTokenRef = useRef(null);
  const [user, setUser] = useState(null);
  return (
    <Router>
    <AuthContext.Provider value={{authTokenRef}} >
      <UserContext.Provider value={{user,setUser}}>
      <Router>
        <Layout>
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/" element={<ProtectedRoute/>}>
              <Route path="/home" element={<PiggyBank />} />
            </Route>
          </Routes>
        </Layout>
      </Router>
      </UserContext.Provider>
      </AuthContext.Provider>
    </Router>
  );
};

export default App;