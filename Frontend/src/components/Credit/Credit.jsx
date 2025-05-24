import React, { useState, useEffect, useRef } from 'react';
import './Credit.css'; // Osigurajte da je putanja ispravna
import { ChatAPI } from '../../api/Chat';

const Credit = () => {
  // Stanja za chat funkcionalnost
  const [messages, setMessages] = useState([]); // Pohranjuje sve poruke u chatu (user i agent)
  const [inputMessage, setInputMessage] = useState(''); // Tekstualni unos korisnika
  const [isTyping, setIsTyping] = useState(false); // Indikator kada AI "tipka" odgovor
  const messagesEndRef = useRef(null); // Ref za posljednji element poruke, za skrolanje
  const messagesDisplayRef = useRef(null); // Ref za kontejner poruka, za provjeru skrolanja

  // Stanja za simulaciju API poziva i prikaz ponuda/prijava
  const [isLoadingOffers, setIsLoadingOffers] = useState(false); // Indikator učitavanja ponuda
  const [creditOffers, setCreditOffers] = useState([]); // Popis kreditnih ponuda
  const [loanApplications, setLoanApplications] = useState([]); // Popis korisnikovih prijava za kredit

  // Stanja za formu prijave za kredit
  const [showLoanForm, setShowLoanForm] = useState(false); // Kontrolira vidljivost forme za prijavu
  const [desiredAmount, setDesiredAmount] = useState(''); // Iznos željenog kredita
  const [loanPurpose, setLoanPurpose] = useState(''); // Svrha kredita
  const [repaymentPeriod, setRepaymentPeriod] = useState(''); // Period otplate u mjesecima
  const [income, setIncome] = useState(''); // Mjesečna primanja korisnika
  const [employmentStatus, setEmploymentStatus] = useState(''); // Status zaposlenja

  // Simulacija API poziva za dohvaćanje kreditnih ponuda
  const simulateFetchCreditOffersApiCall = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const offers = [
          { id: 1, name: 'Stambeni kredit', interestRate: '3.5%', minAmount: '50.000 EUR', maxAmount: '500.000 EUR', period: 'do 30 godina', description: 'Kredit za kupnju, gradnju ili adaptaciju nekretnine.' },
          { id: 2, name: 'Gotovinski kredit', interestRate: '5.2%', minAmount: '1.000 EUR', maxAmount: '50.000 EUR', period: 'do 10 godina', description: 'Brzi kredit za osobne potrebe bez namjene.' },
          { id: 3, name: 'Kredit za automobil', interestRate: '4.8%', minAmount: '5.000 EUR', maxAmount: '80.000 EUR', period: 'do 7 godina', description: 'Financiranje kupnje novog ili rabljenog automobila.' },
          { id: 4, name: 'Studentski kredit', interestRate: '2.9%', minAmount: '500 EUR', maxAmount: '15.000 EUR', period: 'do 5 godina', description: 'Podrška studentima za troškove školovanja i života.' }
        ];
        // Simulacija uspjeha/neuspjeha API poziva
        const success = Math.random() > 0.1; // 90% šanse za uspjeh
        if (success) {
          resolve(offers);
        } else {
          reject(new Error('Pristup kreditnim ponudama je trenutno nedostupan. Molimo pokušajte kasnije.'));
        }
      }, 1500); // Simulira mrežno kašnjenje
    });
  };

  // Simulacija API poziva za slanje prijave za kredit
  const simulateSubmitLoanApplicationApiCall = (applicationData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% šanse za uspjeh
        if (success) {
          const newApplication = {
            id: Date.now(),
            status: 'Na čekanju', // Početni status prijave
            submissionDate: new Date().toISOString().slice(0, 10), // Datum prijave
            ...applicationData
          };
          resolve(newApplication);
        } else {
          reject(new Error('Vaša prijava nije uspjela. Molimo provjerite podatke i pokušajte ponovno.'));
        }
      }, 2000); // Simulira vrijeme obrade prijave
    });
  };

  // Simulacija API poziva za otkazivanje prijave
  const simulateCancelLoanApplicationApiCall = (applicationId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.15; // 85% šanse za uspjeh
        if (success) {
          resolve({ status: 'success', message: 'Prijava uspješno otkazana.' });
        } else {
          reject(new Error('Nije moguće otkazati prijavu. Molimo kontaktirajte podršku.'));
        }
      }, 1000);
    });
  };
  const pocetkaPoruka=useRef(false)
  // useEffect hook za inicijalnu poruku i logiku skrolanja
  useEffect(() => {
    if (pocetkaPoruka.current==true){
      return
    }
    pocetkaPoruka.current=true;
    // Postavi inicijalnu poruku od AI-ja kada se komponenta montira
    if (messages.length === 0) {
      
      addAgentMessage("Pozdrav! Ja sam vaš AI financijski savjetnik za kredite. Kako vam mogu pomoći? Možete me pitati o ratama, uvjetima, ili maksimalnom iznosu kredita.");
    }

    // Logika za pametno skrolanje do dna chata
    const messagesDisplay = messagesDisplayRef.current;
    if (messagesDisplay) {
        // Provjeri je li korisnik već na dnu (ili vrlo blizu dna)
        // Dajem malu marginu (npr. +1 piksel) za preciznost
        const isScrolledToBottom = messagesDisplay.scrollHeight - messagesDisplay.clientHeight <= messagesDisplay.scrollTop + 1;

        const lastMessage = messages[messages.length - 1];

        // Skrolaj automatski na dno samo ako je zadnja poruka od agenta
        // ILI ako je korisnik već bio na dnu (što znači da želi pratiti nove poruke)
        if ((lastMessage && lastMessage.sender === 'agent') || isScrolledToBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }
  }, [messages]); // Ovisnost o 'messages' arrayu

  // Pomoćna funkcija za dodavanje poruke od strane AI agenta
  const addAgentMessage = (text) => {
    setIsTyping(true); // Aktivira indikator tipkanja
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now(), text: text, sender: 'agent' },
      ]);
      setIsTyping(false); // Deaktivira indikator tipkanja
    }, 1500); // Simulira vrijeme koje AI-u treba da "otkuca" odgovor
  };

  // Pomoćna funkcija za dodavanje poruke od strane korisnika
  const addUserMessage = (text) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), text: text, sender: 'user' },
    ]);
  };

 // Glavna funkcija za simulaciju AI odgovora na korisnikov upit
const askOpencv = async (userQuery) => {
  // Priprema historyja u OpenAI formatu
  const _messages = messages.map((message) => ({
    role: message.sender === 'agent' ? 'assistant' : 'user',
    content: message.text,
  }));
  _messages.push({ role: 'user', content: userQuery });

  try {
    // Poziv Chat API-ju
    const response = await ChatAPI.sendMessage(_messages);
    // Ubaci odgovor asistenta u UI
    addAgentMessage(response.data.message.content);
  } catch (error) {
    console.error('Chat API error:', error);

    // Ako dobijemo HTTP grešku s backendom, možete izvući detalje:
    const errMsg =
      error.response?.data?.message ||
      error.message ||
      'Nešto je pošlo po zlu pri slanju na Chat API.';

    // Ubaci poruku o grešci od “assistanta”
    addAgentMessage(`Greška: ${errMsg}`);
  }
};


  // Funkcija za slanje poruke kada korisnik pritisne Enter ili gumb "Pošalji"
  const handleSendMessage = (e) => {
    e.preventDefault(); // Spriječi osvježavanje stranice
    if (inputMessage.trim()) { // Provjeri je li poruka prazna
      addUserMessage(inputMessage.trim()); // Dodaj korisnikovu poruku
      // Odmah skrolaj na dno kako bi korisnik vidio svoju poruku odmah nakon slanja
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      askOpencv(inputMessage.trim()); // Pošalji korisnikovu poruku AI-u na obradu
      setInputMessage(''); // Očisti input polje
    }
  };

  // Funkcija za obradu slanja forme za prijavu kredita
  const handleApplyForLoanSubmit = async (e) => {
    e.preventDefault();
    // Validacija forme
    if (!desiredAmount || !loanPurpose || !repaymentPeriod || !income || !employmentStatus) {
        addAgentMessage("Molimo popunite sva polja u formi.");
        return;
    }
    if (isNaN(parseFloat(desiredAmount)) || parseFloat(desiredAmount) <= 0) {
        addAgentMessage('Molimo unesite valjan pozitivan iznos.');
        return;
    }
    if (isNaN(parseInt(repaymentPeriod)) || parseInt(repaymentPeriod) <= 0) {
        addAgentMessage('Molimo unesite valjan period otplate.');
        return;
    }

    setIsTyping(true); // Pokaži AI da "razmišlja"
    const applicationData = {
      desiredAmount: parseFloat(desiredAmount).toFixed(2),
      loanPurpose,
      repaymentPeriod: parseInt(repaymentPeriod),
      income: parseFloat(income).toFixed(2),
      employmentStatus
    };

    try {
      const newApplication = await simulateSubmitLoanApplicationApiCall(applicationData);
      setLoanApplications(prev => [...prev, newApplication]); // Dodaj novu prijavu u stanje
      addAgentMessage('Vaša prijava za kredit je uspješno poslana! Status: Na čekanju. Možete me pitati za status prijave.');
      // Resetiraj polja forme
      setDesiredAmount('');
      setLoanPurpose('');
      setRepaymentPeriod('');
      setIncome('');
      setEmploymentStatus('');
      setTimeout(() => setShowLoanForm(false), 2000); // Sakrij formu nakon uspješne prijave
    } catch (error) {
      addAgentMessage(`Greška pri slanju prijave: ${error.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  // Funkcija za otkazivanje prijave kredita
  const handleCancelApplication = async (id) => {
    if (!window.confirm('Jeste li sigurni da želite otkazati ovu prijavu?')) {
      return;
    }
    setIsTyping(true);
    try {
      await simulateCancelLoanApplicationApiCall(id);
      setLoanApplications(prev => prev.filter(app => app.id !== id)); // Ukloni prijavu iz stanja
      addAgentMessage('Prijava je uspješno otkazana.');
    } catch (error) {
      addAgentMessage(`Greška pri otkazivanju prijave: ${error.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="credit-section content-section" id="credit-loans">
      <h2>Krediti & AI Asistent</h2>
      <p className="section-description">
        Postavite pitanja našem AI asistentu za brze odgovore o kreditima, izračune rata ili pomoć pri prijavi.
      </p>

      {/* Glavni chat kontejner */}
      <div className="chat-container">
        <div className="messages-display" ref={messagesDisplayRef}> {/* Dodan ref za div poruka */}
          {messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isTyping && ( // Prikaz indikatora tipkanja
            <div className="message-bubble agent typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Prazan div za skrolanje do kraja */}
        </div>

        {/* Forma za unos poruke */}
        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Postavite pitanje ili tražite savjet..."
            disabled={isTyping} // Onemogući unos dok AI tipka
          />
          <button type="submit" disabled={isTyping}> {/* Onemogući gumb dok AI tipka */}
            Pošalji
          </button>
        </form>
      </div>

      {/* Forma za prijavu kredita - prikazuje se uvjetno */}
      {showLoanForm && (
        <div className="loan-application-form-container">
          <h3>Popunite zahtjev za kredit</h3>
          <form onSubmit={handleApplyForLoanSubmit} className="loan-form">
            <div className="form-group">
              <label htmlFor="desiredAmount">Željeni iznos kredita (Euro):</label>
              <input type="number" id="desiredAmount" value={desiredAmount} onChange={(e) => setDesiredAmount(e.target.value)} placeholder="Npr. 15000" min="0" step="0.01" required disabled={isTyping}/>
            </div>
            <div className="form-group">
              <label htmlFor="loanPurpose">Svrha kredita:</label>
              <input type="text" id="loanPurpose" value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)} placeholder="Npr. Kupnja automobila, Edukacija, Renovacija" required disabled={isTyping}/>
            </div>
            <div className="form-group">
              <label htmlFor="repaymentPeriod">Željeni period otplate (mjeseci):</label>
              <input type="number" id="repaymentPeriod" value={repaymentPeriod} onChange={(e) => setRepaymentPeriod(e.target.value)} placeholder="Npr. 60 (5 godina)" min="1" required disabled={isTyping}/>
            </div>
            <div className="form-group">
              <label htmlFor="income">Mjesečna primanja (Euro):</label>
              <input type="number" id="income" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Npr. 1200" min="0" step="0.01" required disabled={isTyping}/>
            </div>
            <div className="form-group">
              <label htmlFor="employmentStatus">Zaposlenje:</label>
              <select id="employmentStatus" value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)} required disabled={isTyping}>
                <option value="">Odaberite status</option>
                <option value="Zaposlen na neodređeno">Zaposlen na neodređeno</option>
                <option value="Zaposlen na određeno">Zaposlen na određeno</option>
                <option value="Umirovljenik">Umirovljenik</option>
                <option value="Student">Student</option>
                <option value="Nezaposlen">Nezaposlen</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowLoanForm(false)} disabled={isTyping}>Odustani</button>
              <button type="submit" className="cta-button" disabled={isTyping}>
                {isTyping ? 'Šaljem zahtjev...' : 'Pošalji zahtjev'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pregled prijava - prikazuje se uvjetno ako postoje prijave */}
      {loanApplications.length > 0 && (
        <div className="loan-applications-section">
            <h3>Moje prijave za kredit</h3>
            <div className="applications-list">
                {loanApplications.map(app => (
                <div key={app.id} className={`application-item status-${app.status.toLowerCase().replace(' ', '-')}`}>
                    <div className="app-details">
                    <p>Iznos: <span>{app.desiredAmount} Euro</span></p>
                    <p>Svrha: <span>{app.loanPurpose}</span></p>
                    <p>Period otplate: <span>{app.repaymentPeriod} mjeseci</span></p>
                    <p>Status: <span className="application-status">{app.status}</span></p>
                    <p className="submission-date">Poslano: {app.submissionDate}</p>
                    </div>
                    {app.status === 'Na čekanju' && (
                    <button
                        className="secondary-button cancel-button"
                        onClick={() => handleCancelApplication(app.id)}
                        disabled={isTyping}
                    >
                        {isTyping ? 'Otkazujem...' : 'Otkaži prijavu'}
                    </button>
                    )}
                </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Credit;