import React, { useState, useEffect } from "react";
import "./HomePage.css";

const HomePage = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((window.scrollY / totalHeight) * 100);
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 50) {
        navbar?.classList.add("scrolled");
      } else {
        navbar?.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ServiceCard = React.memo(({ service }) => (
    <div className="service-card">
      <div className="card-inner">
        <div className="icon-container">
          <service.icon className="service-icon" />
        </div>
        <h3>{service.title}</h3>
        <p>{service.desc}</p>
        <div className="hover-layer"></div>
      </div>
    </div>
  ));

  return (
    <div className="home-container">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <nav className={`navbar ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="logo">
          <span className="gradient-text">MyCompany</span>.
        </div>
        <ul className="nav-links">
          {["Krediti", "Mission", "Features", "Portfolio", "Testimonials", "Team", "FAQ", "Blog", "Contact"].map(
            (section) => (
              <li key={section}>
                <a href={`#${section.toLowerCase()}`} className="nav-link">
                  <span className="link-hover"></span>
                  {section}
                </a>
              </li>
            )
          )}
        </ul>
        <div
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          onKeyDown={(e) => e.key === "Enter" && setMobileMenuOpen(!isMobileMenuOpen)}
          role="button"
          tabIndex={0}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      <header className="hero-section" id="hero">
        <div className="hero-blur"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              <span className="gradient-text">Elevate</span> Your <br />
              <span className="highlight">Digital Presence</span>
            </h1>
            <p className="hero-subtitle">Transform ideas into exceptional digital experiences</p>
            <button className="cta-button">
              Start Your Journey<span className="hover-effect"></span>
            </button>
          </div>
          <div className="hero-visual">
            <div className="gradient-orb"></div>
            <div className="floating-shapes">
              <div className="shape triangle"></div>
              <div className="shape circle"></div>
              <div className="shape square"></div>
            </div>
          </div>
        </div>
      </header>

      <section id="services" className="content-section services-section" style={{ backgroundImage: "url('/backgrounds/services-bg.webp')" }}>
        <h2>
          <span className="section-label">What We Offer</span>Our Services
        </h2>
        <div className="services-grid">
          {servicesData.map((service, i) => (
            <ServiceCard key={i} service={service} />
          ))}
        </div>
      </section>

      <section id="portfolio" className="content-section portfolio-section" style={{ backgroundImage: "url('/backgrounds/portfolio-bg.webp')" }}>
        <h2>
          <span className="section-label">Our Work</span>Featured Projects
        </h2>
        <div className="portfolio-masonry">
          {portfolioItems.map((item, i) => (
            <div className={`portfolio-item ${item.size}`} key={i}>
              <div className="image-container">
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="portfolio-overlay">
                  <div className="overlay-content">
                    <h4>{item.title}</h4>
                    <p>{item.category}</p>
                    <button className="case-study-button" onClick={() => setSelectedProject(item)}>
                      View Case Study<span className="arrow"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{selectedProject.title}</h3>
              <img src={selectedProject.image} alt={selectedProject.title} style={{ maxWidth: "100%" }} />
              <p>Detailed description of {selectedProject.title} goes here.</p>
              <button className="cta-button" onClick={() => setSelectedProject(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </section>

      <section id="testimonials" className="content-section testimonials-section" style={{ backgroundImage: "url('/backgrounds/testimonials-bg.webp')" }}>
        <div className="testimonial-curve"></div>
        <h2>
          <span className="section-label">Client Voices</span>Success Stories
        </h2>
        <div className="testimonial-carousel">
          <div className="testimonial-card">
            <div className="client-photo">
              <img src={testimonials[currentTestimonial].photo} alt={testimonials[currentTestimonial].name} />
            </div>
            <div className="testimonial-content">
              <p className="quote">“{testimonials[currentTestimonial].quote}”</p>
              <div className="client-info">
                <h4>{testimonials[currentTestimonial].name}</h4>
                <p>{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
          </div>
          <div className="carousel-controls">
            <button
              onClick={() =>
                setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
              }
              aria-label="Previous testimonial"
            >
              ❮
            </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              aria-label="Next testimonial"
            >
              ❯
            </button>
          </div>
        </div>
      </section>

      <section id="faq" className="content-section faq-section" style={{ backgroundImage: "url('/backgrounds/faq-bg.webp')" }}>
        <h2>
          <span className="section-label">Need Help?</span>Common Questions
        </h2>
        <div className="faq-grid">
          {faqItems.map((item, i) => (
            <div className={`faq-item ${activeFAQ === i ? "active" : ""}`} key={i} onClick={() => toggleFAQ(i)}>
              <div className="question-container">
                <h4>{item.q}</h4>
                <div className="indicator">
                  <span className="plus"></span>
                </div>
              </div>
              <div className="answer-container">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <h2>Contact Us</h2>
        <form className="contact-form">
          <input type="text" placeholder="Name" aria-label="Name" required />
          <input type="email" placeholder="Email" aria-label="Email" required />
          <textarea placeholder="Message" aria-label="Message" required></textarea>
          <button type="submit" className="cta-button">
            Send
          </button>
        </form>
      </footer>

      <div
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onKeyDown={(e) => e.key === "Enter" && window.scrollTo({ top: 0, behavior: "smooth" })}
        role="button"
        tabIndex={0}
        aria-label="Scroll to top"
      >
        <svg className="progress-circle" viewBox="0 0 50 50">
          <circle className="circle-bg" cx="25" cy="25" r="20" />
          <circle
            className="circle-progress"
            cx="25"
            cy="25"
            r="20"
            style={{ strokeDashoffset: 125.6 * (1 - scrollProgress / 100) }}
          />
        </svg>
        <span className="arrow-up"></span>
      </div>
    </div>
  );
};

const servicesData = [
  {
    title: "UI/UX Design",
    desc: "Immersive user experiences that convert",
    icon: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16v16H4V4z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Web Development",
    desc: "Modern websites built for scale",
    icon: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l9 4v12l-9 4-9-4V6l9-4z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Mobile Apps",
    desc: "Custom apps for iOS and Android",
    icon: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none">
        <path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "SEO Optimization",
    desc: "Boost your rankings and visibility",
    icon: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none">
        <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Brand Strategy",
    desc: "Craft your identity and market presence",
    icon: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

const portfolioItems = [
  { title: "E-commerce Platform", category: "Web Development", image: "/projects/1.webp", size: "wide" },
  { title: "Mobile Dashboard", category: "App Design", image: "/projects/2.webp", size: "tall" },
];

const testimonials = [
  { quote: "Their work transformed our digital presence completely", name: "Sarah Johnson", role: "CEO, TechCorp", photo: "/clients/sarah.jpg" },
  { quote: "Exceptional service and innovative solutions!", name: "Michael Lee", role: "CTO, InnovateX", photo: "/clients/michael.jpg" },
];

const faqItems = [
  { q: "Project timeline?", a: "Typically 4-8 weeks depending on complexity" },
  { q: "Do you offer post-launch support?", a: "Yes, we offer ongoing maintenance and updates" },
  { q: "Can you redesign an existing website?", a: "Absolutely, we specialize in redesign projects" },
  { q: "How do we start?", a: "Schedule a discovery call to align on goals" },
  { q: "Do you handle SEO?", a: "SEO is integrated into all our web projects" },
  { q: "Can you work with startups?", a: "Yes, we love working with ambitious startups" },
];

export default HomePage;
