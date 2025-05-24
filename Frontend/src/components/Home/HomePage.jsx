import React, { useState, useEffect, useRef } from "react";
import "./HomePage.css";

const ServiceCard = React.memo(({ service }) => (
  <div className="service-card">
    <div className="card-inner">
      <div className="icon-container">{service.icon}</div>
      <h3>{service.title}</h3>
      <p>{service.desc}</p>
    </div>
  </div>
));

const TestimonialCard = React.memo(({ testimonial }) => (
  <div className="testimonial-card">
    <p className="testimonial-quote">"{testimonial.quote}"</p>
    <p className="testimonial-author">- {testimonial.author}</p>
  </div>
));

const WhyUsCard = React.memo(({ item }) => (
  <div className="why-us-card">
    <div className="icon-container">{item.icon}</div>
    <h3>{item.title}</h3>
    <p>{item.desc}</p>
  </div>
));

const FeatureCard = React.memo(({ feature }) => (
  <div className="feature-card">
    <div className="icon-container">{feature.icon}</div>
    <h3>{feature.title}</h3>
    <p>{feature.desc}</p>
  </div>
));

const HomePage = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    clientType: "",
    accountNumber: "",
    subject: "",
    priority: "",
    fileAttachment: null,
    message: "",
    privacyConsent: false,
  });
  const [formMessage, setFormMessage] = useState("");
  const formRef = useRef(null);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((window.scrollY / totalHeight) * 100);
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 50) navbar?.classList.add("scrolled");
      else navbar?.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : (type === "file" ? files[0] : value)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormMessage("Datoteka je prevelika (maks. 5MB).");
        e.target.value = null;
        setFormData(prevData => ({ ...prevData, fileAttachment: null }));
        return;
      }
      setFormData(prevData => ({ ...prevData, fileAttachment: file }));
      setFormMessage("");
    } else {
      setFormData(prevData => ({ ...prevData, fileAttachment: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage("Slanje poruke...");

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message || !formData.privacyConsent) {
      setFormMessage("Molimo popunite sva obavezna polja i prihvatite uvjete privatnosti.");
      return;
    }

    console.log("Forma poslana:", formData);

    // U stvarnoj aplikaciji, ovdje biste poslali formData (uključujući fileAttachment) na vaš backend
    // const dataToSend = new FormData();
    // for (const key in formData) {
    //   dataToSend.append(key, formData[key]);
    // }

    // const response = await fetch('/api/contact', {
    //     method: 'POST',
    //     body: dataToSend
    // });
    // const data = await response.json();

    // if (response.ok && data.success) {
        setFormMessage("Vaša poruka je uspješno poslana! Odgovorit ćemo vam u najkraćem mogućem roku.");
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            clientType: "",
            accountNumber: "",
            subject: "",
            priority: "",
            fileAttachment: null,
            message: "",
            privacyConsent: false,
        });
        if (formRef.current) {
          formRef.current.reset();
        }
    // } else {
    //     setFormMessage(data.message || "Došlo je do greške prilikom slanja poruke. Pokušajte ponovno.");
    // }
  };

  return (
    <div className="bank-home-container">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <nav className={`navbar ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="logo">
          <span className="gradient-text">Vaša Pouzdana Banka</span>
        </div>
        <ul className="nav-links">
          {["Početna", "Pogodnosti", "Usluge", "Iskustva", "Zašto mi", "FAQ", "Kontakt"].map((section) => (
            <li key={section}>
              <a href={`#${section.toLowerCase().replace(/\s/g, '-')}`} className="nav-link">{section}</a>
            </li>
          ))}
        </ul>
        <div
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          role="button"
          tabIndex={0}
          aria-label={isMobileMenuOpen ? "Zatvori izbornik" : "Otvori izbornik"}
          onKeyDown={(e) => e.key === "Enter" && setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span><span></span><span></span>
        </div>
      </nav>

      <header className="hero-section" id="hero">
        <div className="hero-content hero-text">
          <h1>Sigurnost. Povjerenje. Financijska snaga.</h1>
          <p className="hero-subtitle">Vaša banka za svaki životni trenutak</p>
          <button className="cta-button">Otvori račun</button>
        </div>
      </header>

      <section id="pogodnosti" className="user-benefits-section">
        <div className="container">
          <h2>Vaš svijet bankarstva na dlanu</h2>
          <p className="section-description">
            Registracijom i prijavom na našu digitalnu platformu otvarate vrata potpuno novom iskustvu! Upravljajte svojim financijama intuitivno, brzo i sigurno, uz niz ekskluzivnih značajki dizajniranih za vašu udobnost i kontrolu:
          </p>
          <div className="user-benefits-grid">
            {userBenefits.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </div>
          <button className="cta-button large-cta-button">Prijavite se i istražite svoj novi svijet bankarstva</button>
        </div>
      </section>

      <section id="usluge" className="services-section content-section">
        <h2>Naše usluge</h2>
        <div className="services-grid">
          {bankServices.map((service, i) => (
            <ServiceCard key={i} service={service} />
          ))}
        </div>
      </section>

      <section id="iskustva" className="testimonials-section content-section">
        <h2>Što kažu naši klijenti?</h2>
        <div className="testimonials-grid">
          {bankTestimonials.map((testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} />
          ))}
        </div>
      </section>

      <section id="zašto-mi" className="why-us-section content-section">
        <h2>Zašto odabrati vašu pouzdanu banku?</h2>
        <div className="why-us-grid">
          {whyChooseUs.map((item, i) => (
            <WhyUsCard key={i} item={item} />
          ))}
        </div>
      </section>

      <section id="faq" className="faq-section content-section">
        <h2>Često postavljena pitanja</h2>
        <div className="faq-grid">
          {bankFAQ.map((item, i) => (
            <div
              className={`faq-item ${activeFAQ === i ? "active" : ""}`}
              key={i}
              onClick={() => toggleFAQ(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && toggleFAQ(i)}
            >
              <div className="question-container">
                <h4>{item.q}</h4>
                <span className="indicator plus"></span>
              </div>
              <div className="answer-container">
                <p className="answer">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer" id="kontakt">
        <h2>Kontaktirajte nas</h2>
        <p className="contact-intro">Imate pitanja? Pošaljite nam poruku ili nas nazovite. Tu smo da vam pomognemo!</p>
        <div className="contact-info">
          <p><strong>Telefon:</strong> +385 1 2345 678</p>
          <p><strong>Radno vrijeme:</strong> Pon-Pet: 08:00 - 16:00</p>
          <p>Trebate hitan odgovor? <a href="#faq" className="inline-link">Provjerite naša često postavljena pitanja</a></p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} ref={formRef}>
          <div className="form-row">
            <input
              type="text"
              name="firstName"
              placeholder="Ime *"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Prezime *"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Broj telefona"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientType">Vrsta klijenta:</label>
              <select
                id="clientType"
                name="clientType"
                value={formData.clientType}
                onChange={handleInputChange}
              >
                <option value="">Odaberite...</option>
                <option value="physical">Fizička osoba</option>
                <option value="legal">Pravna osoba</option>
              </select>
            </div>

            <input
              type="text"
              name="accountNumber"
              placeholder="Broj računa/IBAN (opcionalno)"
              value={formData.accountNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject">Tema poruke *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
              >
                <option value="">Odaberite temu...</option>
                <option value="general">Opći upit</option>
                <option value="account">Pitanja o računu</option>
                <option value="loan">Upit o kreditu</option>
                <option value="savings">Štednja i ulaganja</option>
                <option value="digital">Digitalno bankarstvo / Aplikacija</option>
                <option value="complaint">Pritužba</option>
                <option value="other">Ostalo</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Prioritet poruke:</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="">Odaberite prioritet...</option>
                <option value="low">Nisko</option>
                <option value="medium">Srednje</option>
                <option value="high">Visoko</option>
                <option value="urgent">Hitno</option>
              </select>
            </div>
          </div>

          <div className="form-group file-upload-group">
            <label htmlFor="fileAttachment" className="file-upload-label">
              Priložite datoteku (maks. 5MB, PDF, JPG, PNG)
            </label>
            <input
              type="file"
              id="fileAttachment"
              name="fileAttachment"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="file-input"
            />
            {formData.fileAttachment && (
              <span className="file-name-display">{formData.fileAttachment.name}</span>
            )}
          </div>

          <textarea
            name="message"
            placeholder="Vaša poruka *"
            value={formData.message}
            onChange={handleInputChange}
            required
          ></textarea>

          <div className="privacy-consent-group">
            <input
              type="checkbox"
              id="privacyConsent"
              name="privacyConsent"
              checked={formData.privacyConsent}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="privacyConsent">
              Prihvaćam <a href="/politika-privatnosti" target="_blank" rel="noopener noreferrer" className="inline-link">politiku privatnosti</a> i uvjete korištenja. *
            </label>
          </div>

          {formMessage && <p className={`form-status-message ${formMessage.includes("uspješno") ? "success" : "error"}`}>{formMessage}</p>}

          <button type="submit" className="cta-button">Pošalji poruku</button>
        </form>
      </footer>

      <div
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        role="button"
        tabIndex={0}
        aria-label="Povratak na vrh"
        onKeyDown={(e) => e.key === "Enter" && window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ▲
      </div>
    </div>
  );
};

const bankServices = [
  {
    title: "Krediti za svaki cilj",
    desc: "Fleksibilni uvjeti i brzo odobrenje kredita.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    title: "Štedni računi",
    desc: "Sigurna štednja s izvrsnim kamatama.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
      </svg>
    ),
  },
  {
    title: "Digitalno bankarstvo",
    desc: "Upravljajte računom bilo gdje i bilo kada.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2v20M2 12h20" />
      </svg>
    ),
  },
  {
    title: "Investicijske mogućnosti",
    desc: "Pametne investicije za vaš prosperitet.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8" />
      </svg>
    ),
  },
];

const bankFAQ = [
  { q: "Kako aplicirati za kredit?", a: "Ispunite online prijavu ili posjetite najbližu poslovnicu." },
  { q: "Koji su uvjeti štednje?", a: "Minimalni depozit je 5000 HRK, a kamata ovisi o trajanju štednje." },
  { q: "Kako koristiti digitalno bankarstvo?", a: "Preuzmite našu mobilnu aplikaciju i slijedite upute za registraciju." },
  { q: "Postoji li naknada za vođenje računa?", a: "Ne, osnovno vođenje računa je besplatno za sve klijente." },
];

const bankTestimonials = [
  {
    quote: "Nikad nisam mislio da bankarstvo može biti tako jednostavno! Mobilna aplikacija je fantastična.",
    author: "Ana K., Zagreb",
  },
  {
    quote: "Uz vas sam ostvario svoj san o kupnji stana. Hvala na brzini i podršci!",
    author: "Marko D., Split",
  },
  {
    quote: "Vaša banka mi je pomogla da shvatim kako najbolje uložiti novac. Preporučujem!",
    author: "Ivana P., Rijeka",
  },
];

const whyChooseUs = [
  {
    title: "Pouzdana podrška",
    desc: "Uvijek smo tu za vas, s timom stručnjaka spremnih pomoći.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 11V8h-1.5v3H9v2h1.5v3H12v-3h1.5v-2z"/>
      </svg>
    ),
  },
  {
    title: "Inovativna rješenja",
    desc: "Koristimo najnoviju tehnologiju za vaše financijske potrebe.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.5 17.5a2.5 2.5 0 01-5 0 2.5 2.5 0 015 0zM12 12a3 3 0 11-6 0 3 3 0 016 0zM12 21a3 3 0 11-6 0 3 3 0 016 0zM12 3a3 3 0 11-6 0 3 3 0 016 0zM21 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    title: "Sigurnost vašeg novca",
    desc: "Vaši su depoziti sigurni i zaštićeni na najvišoj razini.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
  },
];

const userBenefits = [
  {
    title: "Pregled stanja i transakcija",
    desc: "Uvijek imajte jasan uvid u stanje vašeg računa i sve transakcije, u realnom vremenu.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 2h6M2 2h6M10 2v3"></path>
      </svg>
    ),
  },
  {
    title: "Jednostavno slanje i primanje novca",
    desc: "Šaljite i primajte novac od kontakata brzo i sigurno, uz minimalan trud.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 11V3H7v8m8 10v-8M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
      </svg>
    ),
  },
  {
    title: "AI financijski asistent (LLM)",
    desc: "Brzo pronađite odgovore na sva pitanja putem našeg pametnog LLM asistenta, 24/7.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle><path d="M8 12a4 4 0 018 0M10 8a2 2 0 100-4 2 2 0 000 4zM14 8a2 2 0 100-4 2 2 0 000 4z"></path>
      </svg>
    ),
  },
  {
    title: "Mlađi od 18: roditeljska kontrola",
    desc: "Sigurno bankarstvo za maloljetnike uz potpunu kontrolu i nadzor roditelja.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 17a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v7a2 2 0 002 2H17zm0 0l-3-3m0 0l-3 3"></path>
      </svg>
    ),
  },
  {
    title: "Planirajte financije",
    desc: "Unesite fiksne prihode i troškove, vizualizirajte budžet i planirajte budućnost.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>
      </svg>
    ),
  },
  {
    title: "Podijelite troškove s prijateljima",
    desc: "Jednostavno dijelite troškove i pratite tko kome duguje nakon zajedničkih aktivnosti.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"></path>
      </svg>
    ),
  },
];

export default HomePage;