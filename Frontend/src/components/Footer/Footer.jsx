import React, { useState } from "react";
import { FiInstagram, FiFacebook, FiLinkedin, FiArrowRight } from "react-icons/fi";
import "./Footer.css";

const BankFooter = ({ show_newsletter = true }) => {
  const [email, setEmail] = useState("");

  const handleSubscription = () => {
    if (validateEmail(email)) {
      console.log("Submitting email:", email);
      alert("Hvala vam na pretplati!");
      setEmail("");
    } else {
      alert("Molimo unesite ispravnu email adresu.");
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <footer className="footer-container">
      {show_newsletter && (
        <div className="newsletter-block">
          <div className="newsletter-content">
            <h2>Vaš financijski kompas. Budite u toku s inovacijama.</h2>
            <p>Pridružite se našoj zajednici!</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Vaša profesionalna email adresa"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="cta-button"
                onClick={handleSubscription}
                type="button"
              >
                Započnite <FiArrowRight className="cta-icon" />
              </button>
            </div>
            <div className="privacy-assurance">
              <span>Nema spama. Odjavite se bilo kada.</span>
            </div>
          </div>
        </div>
      )}

      <div className="footer-grid">
        <div className="brand-column">
          <div className="brand-wrapper">
            <img src="/otp-bank.png" alt="Vaša Pouzdana Banka" className="brand-logo" />
            <p className="brand-statement">Vaša sigurnost, naš prioritet.</p>
            <div className="social-container">
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiInstagram className="social-icon" />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiFacebook className="social-icon" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiLinkedin className="social-icon" />
              </a>
            </div>
          </div>
        </div>

        <div className="nav-columns">
          <div className="nav-group">
            <h3 className="nav-header">Resursi</h3>
            <ul className="nav-list">
              <li><a href="#faq">Često postavljena pitanja</a></li>
              <li><a href="#pogodnosti">Pogodnosti</a></li>
              <li><a href="#iskustva">Iskustva klijenata</a></li>
              <li><a href="#zašto-mi">Zašto mi</a></li>
              <li><a href="#kontakt">Kontakt</a></li>
              <li><a href="#usluge">Usluge</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="legal-block">
        <div className="legal-content">
          <div className="copyright">
            © {new Date().getFullYear()} Vaša Pouzdana Banka. Sva prava pridržana.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BankFooter;