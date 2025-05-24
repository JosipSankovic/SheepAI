import React, { useState, useEffect, useRef } from 'react';
import './Credit.css'; // Osigurajte da je putanja ispravna

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

  // useEffect hook za inicijalnu poruku i logiku skrolanja
  useEffect(() => {
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
  const simulateAIResponse = async (userQuery) => {
    const queryLower = userQuery.toLowerCase();

    // Logika za dohvaćanje i prikaz kreditnih ponuda
    if (queryLower.includes('ponude kredita') || queryLower.includes('koji krediti')) {
        setIsLoadingOffers(true); // Postavi loading status
        try {
            const offers = await simulateFetchCreditOffersApiCall();
            setCreditOffers(offers); // Pohrani dohvaćene ponude
            let responseText = "Trenutno nudimo sljedeće vrste kredita:\n";
            offers.forEach(offer => {
                responseText += `- **${offer.name}**: Kamatna stopa ${offer.interestRate}, iznos ${offer.minAmount}-${offer.maxAmount}, period ${offer.period}.\n`;
            });
            responseText += "\nKoji vas tip kredita zanima? Mogu vam pomoći s detaljima ili izračunom rate.";
            addAgentMessage(responseText);
        } catch (error) {
            addAgentMessage(`Žao mi je, trenutno ne mogu dohvatiti kreditne ponude. Greška: ${error.message}`);
        } finally {
            setIsLoadingOffers(false); // Završi loading status
        }
        return;
    }

    // Logika za izračun rate kredita i maksimalnog iznosa
    if (queryLower.includes('kredit') && queryLower.includes('rata')) {
      const incomeMatch = userQuery.match(/placu (\d+)/); // Pronađi plaću
      const yearsMatch = userQuery.match(/(\d+) godin/); // Pronađi broj godina
      const amountMatch = userQuery.match(/kredit na (\d+)/); // Pronađi traženi iznos (ako postoji)

      const income = incomeMatch ? parseFloat(incomeMatch[1]) : 0;
      const years = yearsMatch ? parseInt(yearsMatch[1]) : 0;
      const requestedAmount = amountMatch ? parseFloat(amountMatch[1]) : 0;

      if (income && years) {
        const annualInterestRate = 0.045; // Simulirana godišnja kamatna stopa
        const monthlyInterestRate = annualInterestRate / 12;
        const numberOfPayments = years * 12;

        let estimatedMonthlyPayment = 0;
        let estimatedMaxLoan = 0;

        if (requestedAmount > 0) {
            // Izračun rate za specifično traženi iznos
            estimatedMonthlyPayment = (requestedAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
            if (estimatedMonthlyPayment > income * 0.45) { // Simulacija ograničenja opterećenja primanja (npr. 45%)
                addAgentMessage(
                  `S plaćom od ${income.toFixed(2)}€ i periodom od ${years} godina, mjesečna rata za **${requestedAmount.toFixed(2)}€** iznosila bi **${estimatedMonthlyPayment.toFixed(2)}€**. Međutim, to prelazi preporučeni postotak opterećenja primanja. Razmislite o manjem iznosu ili dužem periodu otplate.`
                );
                return;
            } else {
                 addAgentMessage(
                    `Sa plaćom od ${income.toFixed(2)}€ i periodom od ${years} godina, mjesečna rata za **${requestedAmount.toFixed(2)}€** iznosila bi približno **${estimatedMonthlyPayment.toFixed(2)}€**.`
                );
            }
        } else {
            // Izračun maksimalnog iznosa kredita na temelju prihoda i perioda
            const maxAffordablePayment = income * 0.35; // Npr. "ugodna" rata ne prelazi 35% primanja
            estimatedMaxLoan = (maxAffordablePayment * (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments))) / monthlyInterestRate;
            estimatedMonthlyPayment = maxAffordablePayment; // Ako je izračunato na temelju maksimalne rate
            addAgentMessage(
              `S vašom plaćom od ${income.toFixed(2)}€ i periodom otplate od ${years} godina, mogli biste potencijalno dobiti kredit do **${estimatedMaxLoan.toFixed(2)}€**, s procijenjenom mjesečnom ratom od oko **${estimatedMonthlyPayment.toFixed(2)}€**.`
            );
        }
      } else {
        // Ako nedostaju ključne informacije
        addAgentMessage("Da bih vam procijenio ratu kredita ili maksimalni iznos, trebam vašu mjesečnu plaću i željeni period otplate u godinama. Npr. 'Ako imam plaću 1500 eura i zelim kredit na 30 godina koliko bi mi iznosila rata kredita i koliko bi mogao dici?'");
      }
      return;
    }

    // Logika za odgovaranje na pitanja o uvjetima specifičnog kredita
    if (queryLower.includes('uvjeti') || queryLower.includes('uvjet') || queryLower.includes('detalji')) {
        if (queryLower.includes('stambenog')) {
            addAgentMessage("Za stambeni kredit potrebna je minimalna mjesečna plaća od 700€, kreditna sposobnost, i hipoteka na nekretninu. Mogu vam poslati više detalja na email ili dogovoriti poziv s našim savjetnikom.");
            return;
        }
        if (queryLower.includes('gotovinskog')) {
            addAgentMessage("Za gotovinski kredit uvjeti uključuju minimalnu plaću od 500€ i urednu kreditnu povijest. Nije potrebna namjena niti jamstvo.");
            return;
        }
    }

    // Logika za pokretanje procesa prijave za kredit (prikaz forme)
    if (queryLower.includes('prijavi') || queryLower.includes('zahtjev')) {
        addAgentMessage("U redu, mogu vam pomoći s prijavom za kredit. Kliknite 'Popuni zahtjev za kredit' ili mi recite vrstu kredita za koju ste zainteresirani pa ću predpopuniti formu.");
        setShowLoanForm(true); // Prikaži formu za prijavu
        return;
    }

    // Logika za provjeru statusa prijava
    if (queryLower.includes('status prijave') || queryLower.includes('moje prijave')) {
        if (loanApplications.length === 0) {
            addAgentMessage("Trenutno nemate aktivnih prijava za kredit.");
        } else {
            let appStatuses = "Vaše trenutne prijave:\n";
            loanApplications.forEach(app => {
                appStatuses += `- ID: ${app.id}, Svrha: ${app.loanPurpose}, Iznos: ${app.desiredAmount}€, Status: ${app.status} (Poslano: ${app.submissionDate})\n`;
            });
            addAgentMessage(appStatuses);
        }
        return;
    }

    // Općenita pitanja i pozdravi
    if (queryLower.includes('hvala') || queryLower.includes('super')) {
      addAgentMessage("Nema na čemu! Tu sam da vam pomognem. Imate li još pitanja?");
      return;
    }
    if (queryLower.includes('bok') || queryLower.includes('zdravo')) {
        addAgentMessage("Pozdrav! Kako vam mogu pomoći danas s vašim kreditnim potrebama?");
        return;
    }

    // Defaultni odgovor ako AI ne prepozna upit
    addAgentMessage("Oprostite, nisam siguran da sam vas razumio. Mogu vam pomoći oko izračuna rata, uvjeta kredita, pokretanja prijave ili statusa vaših postojećih prijava. Molim vas da preformulirate pitanje.");
  };

  // Funkcija za slanje poruke kada korisnik pritisne Enter ili gumb "Pošalji"
  const handleSendMessage = (e) => {
    e.preventDefault(); // Spriječi osvježavanje stranice
    if (inputMessage.trim()) { // Provjeri je li poruka prazna
      addUserMessage(inputMessage.trim()); // Dodaj korisnikovu poruku
      // Odmah skrolaj na dno kako bi korisnik vidio svoju poruku odmah nakon slanja
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      simulateAIResponse(inputMessage.trim()); // Pošalji korisnikovu poruku AI-u na obradu
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