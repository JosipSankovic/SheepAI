import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import './Sidebar.css';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const sidebarItems = [
    { name: 'Moje Stanje', href: '/moje-stanje' },
    { name: 'Moji kontakti', href: '/moji-kontakti' },
    { name: 'Upit za kredit', href: '/upit-za-kredit' },
    { name: 'Skeniraj Račun', href: '/skeniraj-racun' },
    { name: 'Manje od 18 godina', href: '/manje-od-18' },
    { name: 'Podijeli', href: '/podijeli' },
    { name: 'Planiraj Svoje financije', href: '/planiraj-financije' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.matchMedia("(max-width: 767px)").matches &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflowY = isSidebarOpen ? 'hidden' : 'auto';
  }, [isSidebarOpen]);

  return (
    <>
      {/* Toggle button, visible only on mobile */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Otvori sidebar"
      >
        ☰
      </button>

      {/* Overlay for mobile, dims background when Sidebar is open */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar container */}
      <nav
        className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}
        ref={sidebarRef}
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
        </div>
      </nav>
    </>
  );
};

export default Sidebar;