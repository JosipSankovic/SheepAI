import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import "./NotFound.css";

const PAGES = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/product" },
  { name: "Contact Us", path: "/contact" },
  { name: "About", path: "/about" },
  { name: "Careers", path: "/careers" },
  { name: "Partners", path: "/partners" },
  { name: "Services", path: "/services" },
  { name: "AI Integration", path: "/services/ai-integration" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Terms of Service", path: "/terms-of-service" },
  { name: "Cookie Settings", path: "/cookie-settings" },
];

const NotFound = () => {
  const navigate = useNavigate();
  const suggRef = useRef(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [theme, setTheme] = useState("dark");

  const debouncedSetQuery = useCallback(
    debounce((value) => {
      setQuery(value);
      setSelectedIndex(-1);
    }, 300),
    []
  );

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const lower = query.toLowerCase();
    setSuggestions(
      PAGES.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.path.toLowerCase().includes(lower)
      )
    );
  }, [query]);

  const handleSelect = (path) => {
    setQuery("");
    setSuggestions([]);
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex].path);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className={`notfound-wrapper ${theme}`}>
      <title>404 - Page Not Found</title>
      <meta
        name="description"
        content="The page you're looking for doesn't exist. Search our site or return to the homepage."
      />

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="hero-title"
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
        >
          404
        </motion.h1>

        <motion.h2
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Oops, this page got lost in space.
        </motion.h2>

        <motion.form
          role="search"
          aria-label="Site search"
          className="search-form"
          onSubmit={(e) => e.preventDefault()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <input
            type="text"
            placeholder="Search our site..."
            className="search-input"
            value={query}
            onChange={(e) => debouncedSetQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="suggestions-list"
          />
          <button type="submit" className="search-button" aria-label="Search">
            🔍
          </button>
        </motion.form>

        {suggestions.length > 0 && (
          <ul
            id="suggestions-list"
            className="suggestions-list"
            role="listbox"
            ref={suggRef}
          >
            {suggestions.map((p, index) => (
              <li
                key={p.path}
                className={`suggestion-item ${
                  index === selectedIndex ? "selected" : ""
                }`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSelect(p.path)}
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}

        {suggestions.length === 0 && query.trim() && (
          <p className="no-results">
            No pages found. Try a different search term.
          </p>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link to="/" className="notfound-button">
            🚀 Take me home
          </Link>
        </motion.div>
      </motion.div>

      <motion.img
        src="/spaceship.png"
        alt="Spaceship"
        className="spaceship"
        whileHover={{ scale: 1.2, rotate: 10 }}
        onClick={() => navigate("/")}
      />

      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? "🌞" : "🌙"}
      </button>
    </div>
  );
};

export default NotFound;
