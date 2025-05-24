import React, { useState, useEffect, useCallback } from 'react';
import './FinanceSplit.css';

// Pomoćna funkcija za kapitalizaciju stringa
const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Funkcija za dohvaćanje kontakata - SADA HARDKODIRANI ZA TESTIRANJE
const getContacts = () => {
  return [
    { id: 'self', name: 'Ja', avatar: null },
    { id: 'ana', name: 'Ana', avatar: 'https://cdn-icons-png.flaticon.com/512/147/147142.png' }, // Primjer avatara
    { id: 'marko', name: 'Marko', avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
    { id: 'iva', name: 'Iva', avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png' },
    { id: 'petar', name: 'Petar', avatar: 'https://cdn-icons-png.flaticon.com/512/219/219983.png' },
    { id: 'jelena', name: 'Jelena', avatar: null }, // Bez avatara
  ];
};

const FinanceSplit = ({ categoriesFromBudget }) => {
  const [billAmount, setBillAmount] = useState('');
  const [billCategory, setBillCategory] = useState('');
  const [billDescription, setBillDescription] = useState('');
  const [payer, setPayer] = useState('self'); // NOVO: tko je platio
  const [selectedSplitUsers, setSelectedSplitUsers] = useState([]);
  const [splitMethod, setSplitMethod] = useState('equal'); // 'equal', 'manual-percentage', 'manual-amount'
  const [userContributions, setUserContributions] = useState({}); // { userId: amount/percentage }
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Sada koristimo getContacts() umjesto getContactsFromLocalStorage()
  const [availableUsers, setAvailableUsers] = useState(() => getContacts()); 
  const [splitBills, setSplitBills] = useState(() => {
    try {
      const storedBills = JSON.parse(localStorage.getItem('splitBills'));
      return storedBills || [];
    } catch (e) {
      console.error("Failed to parse splitBills from localStorage:", e);
      return [];
    }
  });
  const [debtSummary, setDebtSummary] = useState({}); // NOVO: Praćenje dugovanja

  // Pretpostavit ćemo da su kategorije iz budžeta dostupne
  const defaultCategories = ['hrana', 'zabava', 'stanarina', 'prijevoz', 'štednja', 'ostalo', 'kredit'];
  const availableCategories = categoriesFromBudget && categoriesFromBudget.length > 0
    ? categoriesFromBudget
    : defaultCategories;

  // Efekt za spremanje u localStorage i izračun dugovanja
  useEffect(() => {
    localStorage.setItem('splitBills', JSON.stringify(splitBills));
    calculateDebtSummary(splitBills, availableUsers); // Izračunaj dug nakon promjene računa
  }, [splitBills, availableUsers]);

  // Efekt za dohvaćanje kontakata kada se komponenta montira
  useEffect(() => {
    // SADA KORISTIMO HARDKODIRANE KONTATKE UMJESTO IZ LOCALSTORAGEA
    setAvailableUsers(getContacts());
  }, []);

  // Efekt za inicijalizaciju userContributions kada se odabrani korisnici promijene
  useEffect(() => {
    const newContributions = {};
    if (selectedSplitUsers.length > 0) {
      if (splitMethod === 'equal') {
        const amountPerPerson = parseFloat(billAmount) / selectedSplitUsers.length;
        selectedSplitUsers.forEach(user => {
          newContributions[user.id] = billAmount > 0 ? amountPerPerson.toFixed(2) : '0.00';
        });
      } else if (splitMethod === 'manual-percentage') {
        selectedSplitUsers.forEach(user => {
          newContributions[user.id] = userContributions[user.id] || 0; // Zadrži postojeće postotke ili 0
        });
      } else if (splitMethod === 'manual-amount') {
        selectedSplitUsers.forEach(user => {
          newContributions[user.id] = userContributions[user.id] || '0.00'; // Zadrži postojeće iznose ili 0
        });
      }
    }
    setUserContributions(newContributions);
  }, [selectedSplitUsers, splitMethod, billAmount]);

  const handleUserSelect = (user) => {
    setSelectedSplitUsers(prev => {
      if (prev.find(u => u.id === user.id)) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleManualContributionChange = (userId, value, type) => {
    setErrorMessage(''); // Resetiraj poruku o grešci pri svakoj promjeni unosa
    const parsedValue = parseFloat(value);

    if (value === '') { // Dopusti prazan unos za brisanje
      setUserContributions(prev => ({ ...prev, [userId]: '' }));
      return;
    }

    if (isNaN(parsedValue) || parsedValue < 0) {
      setErrorMessage(`Molimo unesite valjan pozitivan ${type === 'percentage' ? 'postotak' : 'iznos'}.`);
      setUserContributions(prev => ({ ...prev, [userId]: value })); // Ipak dozvoli unos, ali označi kao grešku
      return;
    }

    if (type === 'percentage' && parsedValue > 100) {
      setErrorMessage('Postotak ne smije biti veći od 100.');
      setUserContributions(prev => ({ ...prev, [userId]: value }));
      return;
    }

    setUserContributions(prev => ({ ...prev, [userId]: parsedValue }));
  };

  const calculateTotalManual = () => {
    if (splitMethod === 'manual-percentage') {
      return selectedSplitUsers.reduce((sum, user) => {
        const percentage = parseFloat(userContributions[user.id]) || 0;
        return sum + percentage;
      }, 0);
    } else if (splitMethod === 'manual-amount') {
      return selectedSplitUsers.reduce((sum, user) => {
        const amount = parseFloat(userContributions[user.id]) || 0;
        return sum + amount;
      }, 0);
    }
    return 0;
  };

  const calculateAmountFromPercentage = (userId) => {
    if (splitMethod === 'manual-percentage' && billAmount > 0 && userContributions[userId] !== undefined && userContributions[userId] !== '') {
      const percentage = parseFloat(userContributions[userId]);
      return ((parseFloat(billAmount) * percentage) / 100).toFixed(2);
    }
    return '0.00';
  };

  // NOVO: Glavna logika za izračun dugovanja
  const calculateDebtSummary = useCallback((bills, users) => {
    const debts = {}; // { userId: { owes: { otherUserId: amount }, getsBack: { otherUserId: amount } } }
    const netBalances = {}; // { userId: totalNetBalance }

    // Inicijaliziraj sve korisnike
    users.forEach(user => {
      debts[user.id] = { owes: {}, getsBack: {} };
      netBalances[user.id] = 0;
    });

    bills.forEach(bill => {
      const payerId = bill.payer;
      const totalBillAmount = bill.amount;

      // Ako uplatitelj nije jedan od korisnika, preskoči (trebao bi biti validiran)
      if (!netBalances.hasOwnProperty(payerId)) {
        console.warn(`Payer ${payerId} not found in available users.`);
        return;
      }

      // Uplatitelj je dao cijeli iznos
      netBalances[payerId] += totalBillAmount;

      bill.splitDetails.forEach(detail => {
        const consumerId = detail.userId;
        const consumerContribution = parseFloat(detail.contribution);

        // Ako je korisnik sam uplatitelj, njegov doprinos smanjuje njegov neto balans
        // Uplatitelj je dao novac za SVE, pa mu se 'vraća' njegov dio
        // Neto balans mu se smanjuje za ono što je "potrošio"
        netBalances[payerId] -= consumerContribution;

        // Potrošač je trebao platiti svoj doprinos
        netBalances[consumerId] -= consumerContribution;
      });
    });

    // Druga faza: pretvoriti neto stanje u dugovanja
    // Sortiraj korisnike po neto stanju (oni koji duguju idu prvi)
    const sortedUsers = Object.keys(netBalances).sort((a, b) => netBalances[a] - netBalances[b]);

    let i = 0;
    let j = sortedUsers.length - 1;

    while (i < j) {
      const debtorId = sortedUsers[i];
      const creditorId = sortedUsers[j];

      let debtorBalance = netBalances[debtorId]; // Negativan ili nula
      let creditorBalance = netBalances[creditorId]; // Pozitivan ili nula

      // Ako je dug nula, ne radimo ništa
      if (debtorBalance >= 0) {
        i++;
        continue;
      }
      if (creditorBalance <= 0) {
        j--;
        continue;
      }

      const amountToSettle = Math.min(Math.abs(debtorBalance), creditorBalance);

      if (amountToSettle > 0.01) { // Samo ako je značajan iznos
        // Debtor owes Creditor
        debts[debtorId].owes[creditorId] = ((debts[debtorId].owes[creditorId] || 0) + amountToSettle).toFixed(2);
        // Creditor gets back from Debtor
        debts[creditorId].getsBack[debtorId] = ((debts[creditorId].getsBack[debtorId] || 0) + amountToSettle).toFixed(2);

        netBalances[debtorId] += amountToSettle;
        netBalances[creditorId] -= amountToSettle;
      }

      if (Math.abs(netBalances[debtorId]) < 0.01) { // Debtor settled
        i++;
      }
      if (Math.abs(netBalances[creditorId]) < 0.01) { // Creditor is fully paid
        j--;
      }
    }

    setDebtSummary(debts);
  }, []);

  // Simulirani API poziv za dodavanje računa
  const simulateAddBillApiCall = (billData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% šanse za uspjeh
        if (success) {
          resolve({ status: 'success', message: 'Račun uspješno dodan!', bill: billData });
        } else {
          reject({ status: 'error', message: 'Došlo je do greške prilikom dodavanja računa. Pokušajte ponovno.' });
        }
      }, 1500 + Math.random() * 1000);
    });
  };

  // Simulirani API poziv za poravnanje duga
  const simulateSettleDebtApiCall = (debtorId, creditorId, amount) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% šanse za uspjeh
        if (success) {
          resolve({ status: 'success', message: `Dug od ${availableUsers.find(u => u.id === debtorId)?.name || 'Nepoznato'} prema ${availableUsers.find(u => u.id === creditorId)?.name || 'Nepoznato'} u iznosu od ${amount}€ uspješno poravnan.` });
        } else {
          reject({ status: 'error', message: `Došlo je do greške prilikom poravnanja duga. Pokušajte ponovno.` });
        }
      }, 1000 + Math.random() * 500); // Kraće vrijeme za poravnanje
    });
  };

  const addSplitBill = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isLoading) return;

    if (!billAmount || parseFloat(billAmount) <= 0) {
      setErrorMessage('Molimo unesite valjan pozitivan iznos računa.');
      return;
    }
    if (!billCategory) {
      setErrorMessage('Molimo odaberite kategoriju računa.');
      return;
    }
    if (selectedSplitUsers.length === 0) {
      setErrorMessage('Molimo odaberite barem jednu osobu za podjelu računa.');
      return;
    }

    const totalCalculatedAmount = calculateTotalManual();
    if (splitMethod === 'manual-percentage') {
      if (totalCalculatedAmount !== 100) {
        setErrorMessage(`Postoci moraju zbrojiti 100%. Trenutno je ${totalCalculatedAmount.toFixed(0)}%.`);
        return;
      }
      if (selectedSplitUsers.some(user => userContributions[user.id] === '' || userContributions[user.id] === undefined)) {
        setErrorMessage('Molimo unesite postotak za sve odabrane osobe.');
        return;
      }
    } else if (splitMethod === 'manual-amount') {
      if (Math.abs(totalCalculatedAmount - parseFloat(billAmount)) > 0.01) { // Provjera s tolerancijom
        setErrorMessage(`Zbroj iznosa mora biti jednak ukupnom iznosu računa (${parseFloat(billAmount).toFixed(2)}€). Trenutno je ${totalCalculatedAmount.toFixed(2)}€.`);
        return;
      }
      if (selectedSplitUsers.some(user => userContributions[user.id] === '' || userContributions[user.id] === undefined)) {
        setErrorMessage('Molimo unesite iznos za sve odabrane osobe.');
        return;
      }
    }

    const billData = {
      id: Date.now(),
      amount: parseFloat(billAmount),
      category: billCategory,
      description: billDescription,
      payer: payer,
      splitDetails: selectedSplitUsers.map(user => ({
        userId: user.id,
        userName: user.name,
        // Izračunaj stvarni doprinos ovisno o metodi
        contribution: splitMethod === 'equal'
          ? (parseFloat(billAmount) / selectedSplitUsers.length).toFixed(2)
          : (splitMethod === 'manual-percentage'
            ? calculateAmountFromPercentage(user.id)
            : parseFloat(userContributions[user.id]).toFixed(2)),
        percentage: splitMethod === 'manual-percentage' ? (parseFloat(userContributions[user.id]) || 0) : null,
        method: splitMethod
      })),
      date: new Date().toISOString().split('T')[0],
    };

    setIsLoading(true);

    try {
      const response = await simulateAddBillApiCall(billData);
      setSuccessMessage(response.message);
      setSplitBills(prev => [...prev, response.bill]);

      // Resetiraj formu nakon uspjeha
      setBillAmount('');
      setBillCategory('');
      setBillDescription('');
      setPayer('self');
      setSelectedSplitUsers([]);
      setUserContributions({});
      setSplitMethod('equal');

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 4000);
    }
  };

  const deleteSplitBill = (id) => {
    // Potvrda prije brisanja
    if (window.confirm('Jeste li sigurni da želite obrisati ovaj račun?')) {
      setSplitBills(prev => prev.filter(bill => bill.id !== id));
      setSuccessMessage('Račun uspješno obrisan.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSettleDebt = async (debtorId, creditorId, amount) => {
    const debtorName = availableUsers.find(u => u.id === debtorId)?.name || 'Nepoznato';
    const creditorName = availableUsers.find(u => u.id === creditorId)?.name || 'Nepoznato';

    if (!window.confirm(`Jeste li sigurni da želite poravnati dug od ${debtorName} prema ${creditorName} u iznosu od ${amount}€?`)) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await simulateSettleDebtApiCall(debtorId, creditorId, amount);
      setSuccessMessage(response.message);

      // NOVO: Ažuriranje splitBills kako bi se zabilježilo poravnanje
      // Najlakši način je dodati "transakciju poravnanja" u splitBills,
      // ili modificirati postojeće dugove. Za jednostavnost, dodajmo "virtualni" račun za poravnanje.
      const settlementBill = {
        id: Date.now(),
        amount: -parseFloat(amount), // Negativan iznos za poravnanje
        category: 'poravnanje duga',
        description: `Poravnanje duga: ${debtorName} platio ${creditorName}`,
        payer: debtorId,
        splitDetails: [
          // Važno: ako je ovo poravnanje, debtor je "platio" amount, a creditor je "primio" amount.
          // Da bi se neto stanje ispravno odrazilo:
          // Debtor (uplatitelj): njegov neto balans treba rasti za amount (smanjio je dug)
          // Creditor (primatelj): njegov neto balans treba padati za amount (primio je novac)
          // Originalna logika je već dosta dobra za praćenje neto stanja.
          // Ovdje je ključno da se iznos oduzme od duga debtoru i doda creditoru.
          // Bil je plaćen od strane "debtorId", ali se "potrošnja" odnosi na "creditorId" koji je sada "platio" taj iznos natrag.
          // U suštini, debtor je dao novac creditoru.
          { userId: creditorId, userName: creditorName, contribution: -parseFloat(amount).toFixed(2), method: 'settlement' }, // Creditorov dug je smanjen
          { userId: debtorId, userName: debtorName, contribution: 0, method: 'settlement' } // Debtor daje novac, njegov udio je 0 u smislu "potrošnje"
        ],
        date: new Date().toISOString().split('T')[0],
        isSettlement: true // Označimo da je ovo račun za poravnanje
      };
      setSplitBills(prev => [...prev, settlementBill]);

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 4000);
    }
  };


  return (
    <div className="finance-split-section content-section" id="finance-split">
      <h2>Podjela Računa</h2>
      <p className="section-description">
        Podijelite troškove s prijateljima i pratite tko kome duguje.
      </p>

      <div className="split-form-container planner-card">
        <h3>Novi Podijeljeni Račun</h3>
        <form onSubmit={addSplitBill} className="split-bill-form">
          <div className="form-group">
            <label htmlFor="billAmount">Ukupan iznos računa (€):</label>
            <input
              type="number"
              id="billAmount"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              min="0"
              step="0.01"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="billCategory">Kategorija računa:</label>
            <select
              id="billCategory"
              value={billCategory}
              onChange={(e) => setBillCategory(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Odaberi kategoriju</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{capitalize(cat)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="billDescription">Opis (opcionalno):</label>
            <textarea
              id="billDescription"
              value={billDescription}
              onChange={(e) => setBillDescription(e.target.value)}
              rows="2"
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="payer">Tko je platio račun?</label>
            <select
              id="payer"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              disabled={isLoading}
            >
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Odaberite osobe za podjelu (uključujući sebe ako dijelite):</label>
            <div className="user-selection-grid">
              {availableUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-selection-card ${selectedSplitUsers.find(u => u.id === user.id) ? 'selected' : ''} ${isLoading ? 'disabled' : ''}`}
                  onClick={() => !isLoading && handleUserSelect(user)}
                >
                  <div className="user-initials">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="user-avatar" />
                    ) : (
                        user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedSplitUsers.length > 0 && (
            <div className="form-group">
              <label>Način podjele:</label>
              <div className="split-method-toggle">
                <button
                  type="button"
                  className={`toggle-button ${splitMethod === 'equal' ? 'active' : ''}`}
                  onClick={() => !isLoading && setSplitMethod('equal')}
                  disabled={isLoading}
                >
                  Ravnomjerno
                </button>
                <button
                  type="button"
                  className={`toggle-button ${splitMethod === 'manual-percentage' ? 'active' : ''}`}
                  onClick={() => !isLoading && setSplitMethod('manual-percentage')}
                  disabled={isLoading}
                >
                  Ručno (%)
                </button>
                <button
                  type="button"
                  className={`toggle-button ${splitMethod === 'manual-amount' ? 'active' : ''}`}
                  onClick={() => !isLoading && setSplitMethod('manual-amount')}
                  disabled={isLoading}
                >
                  Ručno (€)
                </button>
              </div>
            </div>
          )}

          {selectedSplitUsers.length > 0 && (
            <div className="split-details-section">
              <h4>Detalji podjele:</h4>
              {splitMethod === 'equal' ? (
                <p>Svaka osoba plaća: <strong>{(parseFloat(billAmount) / selectedSplitUsers.length || 0).toFixed(2)}€</strong></p>
              ) : (
                <div className="manual-split-inputs">
                  {selectedSplitUsers.map(user => (
                    <div key={user.id} className="manual-split-item">
                      <label>{user.name}:</label>
                      <input
                        type="number"
                        value={userContributions[user.id] || ''}
                        onChange={(e) => handleManualContributionChange(user.id, e.target.value, splitMethod === 'manual-percentage' ? 'percentage' : 'amount')}
                        min="0"
                        step={splitMethod === 'manual-percentage' ? "0.1" : "0.01"}
                        placeholder={splitMethod === 'manual-percentage' ? "%" : "€"}
                        disabled={isLoading}
                      />
                      {splitMethod === 'manual-percentage' && (
                        <>
                          <span className="percentage-display">{userContributions[user.id] !== '' ? `${userContributions[user.id]}%` : '0%'} </span>
                          <span className="amount-display">({calculateAmountFromPercentage(user.id)}€)</span>
                        </>
                      )}
                      {splitMethod === 'manual-amount' && (
                        <span className="amount-display">{parseFloat(userContributions[user.id] || 0).toFixed(2)}€</span>
                      )}
                    </div>
                  ))}
                  <p className={`total-percentage ${
                    splitMethod === 'manual-percentage' && calculateTotalManual() === 100 ? 'valid' :
                    splitMethod === 'manual-amount' && Math.abs(calculateTotalManual() - parseFloat(billAmount)) < 0.01 ? 'valid' : 'invalid'
                  }`}>
                    Ukupno: <strong>{calculateTotalManual().toFixed(splitMethod === 'manual-percentage' ? 0 : 2)}{splitMethod === 'manual-percentage' ? '%' : '€'}</strong>
                    {splitMethod === 'manual-amount' && (
                      <span> od {parseFloat(billAmount).toFixed(2)}€</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {errorMessage && <p className="message error-message">{errorMessage}</p>}
          {successMessage && <p className="message success-message">{successMessage}</p>}

          <button type="submit" className="cta-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Dodajem...
              </>
            ) : (
              'Dodaj podijeljeni račun'
            )}
          </button>
        </form>
      </div>

      <div className="split-debt-summary planner-card">
        <h3>Pregled Dugovanja</h3>
        {Object.keys(debtSummary).length === 0 || (Object.values(debtSummary).every(userDebts => Object.keys(userDebts.owes).length === 0 && Object.keys(userDebts.getsBack).length === 0)) ? (
          <p className="no-data-message">Trenutno nema otvorenih dugovanja.</p>
        ) : (
          <div className="debt-summary-list">
            {Object.keys(debtSummary).map(userId => {
              const user = availableUsers.find(u => u.id === userId);
              if (!user) return null; // Should not happen if data is consistent

              const owesTo = Object.keys(debtSummary[userId].owes);
              const getsBackFrom = Object.keys(debtSummary[userId].getsBack);

              if (owesTo.length === 0 && getsBackFrom.length === 0) return null; // No active debt for this user

              return (
                <div key={userId} className="user-debt-card">
                  <div className="user-initials large">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="user-avatar" />
                    ) : (
                        user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <h4>{user.name}</h4>
                  {owesTo.length > 0 && (
                    <div className="debt-section owes">
                      <h5>Duguješ:</h5>
                      {owesTo.map(creditorId => {
                        const creditor = availableUsers.find(u => u.id === creditorId);
                        const amount = debtSummary[userId].owes[creditorId];
                        return (
                          <p key={creditorId}>
                            <span className="debt-amount">{amount}€</span> {creditor?.name}
                            <button
                              className="secondary-button small-button settle-button"
                              onClick={() => handleSettleDebt(userId, creditorId, amount)}
                              disabled={isLoading}
                            >
                              Poravnaj
                            </button>
                          </p>
                        );
                      })}
                    </div>
                  )}
                  {getsBackFrom.length > 0 && (
                    <div className="debt-section gets-back">
                      <h5>Trebaš dobiti:</h5>
                      {getsBackFrom.map(debtorId => {
                        const debtor = availableUsers.find(u => u.id === debtorId);
                        const amount = debtSummary[userId].getsBack[debtorId];
                        return (
                          <p key={debtorId}>
                            <span className="debt-amount">{amount}€</span> od {debtor?.name}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="split-list-container planner-card">
        <h3>Povijest Podijeljenih Računa</h3>
        {splitBills.length === 0 ? (
          <p className="no-data-message">Još niste dodali niti jedan podijeljeni račun.</p>
        ) : (
          <div className="split-bills-table">
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Iznos</th>
                  <th>Kategorija</th>
                  <th>Opis</th>
                  <th>Uplatitelj</th>
                  <th>Podijeljeno s</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {splitBills.filter(bill => !bill.isSettlement).map(bill => ( // Filter out settlement bills
                  <tr key={bill.id}>
                    <td>{bill.date}</td>
                    <td>{bill.amount.toFixed(2)}€</td>
                    <td>{capitalize(bill.category)}</td>
                    <td>{bill.description || '-'}</td>
                    <td>{availableUsers.find(u => u.id === bill.payer)?.name || bill.payer}</td>
                    <td>
                      {bill.splitDetails.map((detail, index) => (
                        <div key={index}>
                          {detail.userName}: {detail.contribution}€ {detail.method === 'manual-percentage' ? `(${detail.percentage}%)` : ''}
                        </div>
                      ))}
                    </td>
                    <td>
                      <button className="secondary-button small-button delete-button" onClick={() => deleteSplitBill(bill.id)} disabled={isLoading}>Izbriši</button>
                    </td>
                  </tr>
                ))}
                {splitBills.filter(bill => bill.isSettlement).length > 0 && ( // Prikaz poravnanja ispod, ako ih ima
                    <>
                        <tr className="settlement-divider-row">
                            <td colSpan="7">--- Poravnanja Dugova ---</td>
                        </tr>
                        {splitBills.filter(bill => bill.isSettlement).map(bill => (
                            <tr key={bill.id} className="settlement-row">
                                <td>{bill.date}</td>
                                <td>{bill.amount.toFixed(2)}€</td>
                                <td>{capitalize(bill.category)}</td>
                                <td>{bill.description || '-'}</td>
                                <td>{availableUsers.find(u => u.id === bill.payer)?.name || bill.payer}</td>
                                <td>
                                    {bill.splitDetails.map((detail, index) => (
                                        <div key={index}>
                                            {detail.userName}: {detail.contribution}€
                                        </div>
                                    ))}
                                </td>
                                <td>
                                    {/* Opcija za brisanje poravnanja može biti riskantna ako utječe na dugovanja,
                                        ali za demo se može ostaviti */}
                                    <button className="secondary-button small-button delete-button" onClick={() => deleteSplitBill(bill.id)} disabled={isLoading}>Poništi poravnanje</button>
                                </td>
                            </tr>
                        ))}
                    </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceSplit;