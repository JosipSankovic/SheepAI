import React, { useState } from "react";
import { FiInstagram, FiFacebook, FiLinkedin, FiArrowRight } from "react-icons/fi";
import "./Footer.css";

const BankFooter = ({ show_newsletter = true }) => {
  const [email, setEmail] = useState("");

  const handleSubscription = () => {
    if (validateEmail(email)) {
      console.log("Submitting email:", email);
      alert("Thank you for subscribing!");
      setEmail("");
    } else {
      alert("Please enter a valid email address");
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
            <h2>Stay ahead of your competition</h2>
            <p>Join our community</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Your professional email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="cta-button"
                onClick={handleSubscription}
                type="button"
              >
                Get Started <FiArrowRight className="cta-icon" />
              </button>
            </div>
            <div className="privacy-assurance">
              <span>Zero spam. Unsubscribe anytime.</span>
            </div>
          </div>
        </div>
      )}

      <div className="footer-grid">
        <div className="brand-column">
          <div className="brand-wrapper">
            <img src="/Logo.webp" alt="Waysmaking" className="brand-logo" />
            <p className="brand-statement">Create, Innovate, Adjust</p>
            <div className="social-container">
              <a href="#" className="social-link">
                <FiInstagram className="social-icon" />
              </a>
              <a href="#" className="social-link">
                <FiFacebook className="social-icon" />
              </a>
              <a href="#" className="social-link">
                <FiLinkedin className="social-icon" />
              </a>
            </div>
          </div>
        </div>

        <div className="nav-columns">
          <div className="nav-group">
            <h3 className="nav-header">Company</h3>
            <ul className="nav-list">
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Partners</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Products</a></li>
              <li><a href="#">Services</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="legal-block">
        <div className="legal-content">
          <div className="copyright">
            © {new Date().getFullYear()} OurBank. Your way of thinking our way of making.
          </div>
          <div className="legal-links">
            <a href="privacy-policy">Privacy Policy</a>
            <a href="terms-of-service">Terms of Service</a>
            <a href="cookie-settings">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BankFooter;
