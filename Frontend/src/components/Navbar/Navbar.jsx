import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import './Navbar.css';

const Navbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const langRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navigation = [
    // { name: 'About', href: '/about' },
    // { name: 'Careers', href: '/careers' },
    // { name: 'Partners', href: '/partners' },
    { name: 'Prijavi se', href: '/login' },
    { name: 'Registiraj se', href: '/product' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '/uk.png' },
    { code: 'hr', name: 'Hrvatski', flag: '/croatia.png' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflowY = isMobileOpen ? 'hidden' : 'auto';
  }, [isMobileOpen]);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="container-navbar">
        <Link to="/" className="nav-logo" aria-label="Home">
          <img
            src="/otp-bank.png"
            alt="Company Logo"
            className="brand-logo"
            width="200"
            height="200"
          />
        </Link>
        <div className="nav-items">
          {navigation.map((item) => (
            <div key={item.name} className="dropdown">
              {item.subItems ? (
                <>
                  <Link to={item.href} className="nav-link">{item.name}</Link>
                  <div className="dropdown-content">
                    {item.subItems.map((sub) => (
                      <Link key={sub.label} to={sub.href} className="dropdown-item">
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link to={item.href} className="nav-link">{item.name}</Link>
              )}
            </div>
          ))}
          {/* <div className="language-selector" ref={langRef}>
            <button
              className="language-trigger"
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-label="Language selector"
            >
              <img
                src={languages.find(l => l.code === selectedLang)?.flag}
                alt=""
                className="flag-icon"
              />
              <span>{selectedLang.toUpperCase()}</span>
            </button>
            <div className={`language-dropdown ${isLangOpen ? 'visible' : ''}`}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setIsLangOpen(false);
                  }}
                >
                  <img src={lang.flag} alt="" className="flag-icon" />
                  {lang.name}
                </button>
              ))}
            </div>
          </div> */}
        </div>

        <button
          className={`mobile-menu-button ${isMobileOpen ? 'active' : ''}`}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle mobile menu"
        >
          <span className="hamburger">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </span>
        </button>
      </div>

      <div className={`mobile-menu-overlay ${isMobileOpen ? 'visible' : ''}`}>
        <div className="mobile-menu-open" ref={mobileMenuRef}>
          <div className="mobile-menu-header">
            <Link to="/" className="nav-logo">
              <img
                src="/Logo.webp"
                alt="Company Logo"
                className="brand-logo"
                width="45"
                height="45"
              />
            </Link>
            <button
              className="mobile-menu-close"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="mobile-menu-body">
            {navigation.map((item) => (
              <div key={item.name} className="mobile-menu-item">
                {item.subItems ? (
                  <>
                    <Link to={item.href} className="nav-link">
                      {item.name}
                    </Link>
                    <div className="dropdown-content">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          className="dropdown-item"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.href}
                    className="nav-link"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            <div className="mobile-language-selector">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setIsMobileOpen(false);
                  }}
                >
                  <img src={lang.flag} alt="" className="flag-icon" />
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
