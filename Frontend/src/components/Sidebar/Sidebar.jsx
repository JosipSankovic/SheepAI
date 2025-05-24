import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import LogoutBtn from "./LogoutBtn";
import { UserAPI } from "../../api/User";
import { UserContext } from "../../utils";

const sidebarItems = [
  { name: "Stanje", href: "" },
  {name:"Kids",href:"kids"},
  { name: "Kontakti", href: "contacts" },
  { name: "Upit za kredit", href: "credit" },
  { name: "Planiraj financije", href: "planfinance" },
  { name: "Podijeli", href: "splitfinance" },
];

function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const {user,setUser}=useContext(UserContext)
  function logout(event) {
      UserAPI.logout().then((res)=>{
        setUser(null);
        navigate("/");
      }).catch((error)=>{
        console.error(error)
      });
      
    }
  // Zatvori sidebar kad se klikne izvan njega
  useEffect(() => {
    function handleOutsideClick(e) {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setIsSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSidebarOpen]);

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Otvori sidebar"
      >
        ☰
      </button>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <nav
        ref={sidebarRef}
        className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}
        aria-label="Navigacija sidebar-a"
      >
        <div className="sidebar-header">
          <button
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Zatvori sidebar"
          >
            ×
          </button>
        </div>

        <div className="sidebar-items">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        <LogoutBtn onClick={logout} />

        </div>
      </nav>
    </>
  );
}

export default Sidebar;
