import React, { useState, useEffect } from 'react';
import './Kids.css';

let nextAccountId = 1;

const Kids = () => {
  const [childrenAccounts, setChildrenAccounts] = useState(() => {
    try {
      const savedAccounts = localStorage.getItem('kidsBankChildrenAccounts');
      if (savedAccounts) {
        const parsedAccounts = JSON.parse(savedAccounts);
        if (parsedAccounts.length > 0) {
          nextAccountId = Math.max(...parsedAccounts.map(acc => acc.id)) + 1;
        }
        return parsedAccounts;
      }
      return [];
    } catch (error) {
      console.error("Failed to parse children accounts from localStorage:", error);
      return [];
    }
  });

  const [showCreationForm, setShowCreationForm] = useState(false);
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [allowOnlineSpending, setAllowOnlineSpending] = useState(true);
  const [pocketMoneyAmount, setPocketMoneyAmount] = useState('');
  const [pocketMoneyFrequency, setPocketMoneyFrequency] = useState('monthly');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedChildAccount, setSelectedChildAccount] = useState(null);
  const [sendMoneyAmount, setSendMoneyAmount] = useState('');
  const [sendMoneyDescription, setSendMoneyDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    localStorage.setItem('kidsBankChildrenAccounts', JSON.stringify(childrenAccounts));
  }, [childrenAccounts]);

  useEffect(() => {
    if (isDetailsModalOpen && selectedChildAccount) {
      const updatedAccount = childrenAccounts.find(acc => acc.id === selectedChildAccount.id);
      if (updatedAccount) {
        setSelectedChildAccount(updatedAccount);
      } else {
        closeDetailsModal();
      }
    }
  }, [childrenAccounts, isDetailsModalOpen, selectedChildAccount]);


  const getSimulatedTransactions = (initialDep = 0) => {
    const transactions = [];
    if (initialDep > 0) {
        transactions.push({ id: 0, description: 'Početni depozit', amount: initialDep, date: '2024-05-01', type: 'in' });
    }
    transactions.push(
        { id: 1, description: 'Džeparac', amount: 100.00, date: '2024-05-05', type: 'in' },
        { id: 2, description: 'Kupnja slatkiša', amount: -50.00, date: '2024-05-06', type: 'out' },
        { id: 3, description: 'Online igra', amount: -25.00, date: '2024-05-08', type: 'out' },
        { id: 4, description: 'Džeparac', amount: 100.00, date: '2024-05-12', type: 'in' },
    );
    return transactions;
  };

  const simulateCreateAccountApiCall = (accountData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.2;
        if (success) {
          resolve({ status: 'success', message: 'Dječji račun uspješno kreiran!', accountId: nextAccountId++ });
        } else {
          reject({ status: 'error', message: 'Greška pri kreiranju računa. Pokušajte ponovno.' });
        }
      }, 2000);
    });
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!childName.trim() || !childDob) {
      setMessage('Molimo popunite sva obavezna polja (Ime, Datum rođenja).');
      setMessageType('error');
      return;
    }

    const today = new Date();
    const dobDate = new Date(childDob);
    let ageInYears = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        ageInYears--;
    }

    if (ageInYears < 0 || ageInYears > 18) {
        setMessage('Datum rođenja mora biti unutar razumnog raspona (0-18 godina starosti).');
        setMessageType('error');
        return;
    }

    setIsLoading(true);

    const initialDep = initialDeposit ? parseFloat(initialDeposit) : 0;
    const simulatedTransactions = getSimulatedTransactions(initialDep);
    const calculatedBalance = simulatedTransactions.reduce((sum, t) => sum + t.amount, 0);

    const newAccountData = {
      name: childName.trim(),
      dob: childDob,
      initialDeposit: initialDep.toFixed(2),
      dailyLimit: dailyLimit ? parseFloat(dailyLimit).toFixed(2) : 'Nema',
      allowOnlineSpending: allowOnlineSpending,
      pocketMoney: pocketMoneyAmount ? `${parseFloat(pocketMoneyAmount).toFixed(2)} Euro ${pocketMoneyFrequency === 'daily' ? 'dnevno' : pocketMoneyFrequency === 'weekly' ? 'tjedno' : 'mjesečno'}` : 'Nema',
      balance: calculatedBalance,
      transactions: simulatedTransactions,
      savingsGoal: { target: 1000, current: calculatedBalance > 0 ? Math.min(1000, calculatedBalance) : 0, description: 'Za novu igračku' }
    };

    try {
      const response = await simulateCreateAccountApiCall(newAccountData);
      const createdAccount = { id: response.accountId, ...newAccountData };

      setChildrenAccounts(prev => [...prev, createdAccount]);
      setMessage(response.message);
      setMessageType('success');

      setChildName('');
      setChildDob('');
      setInitialDeposit('');
      setDailyLimit('');
      setAllowOnlineSpending(true);
      setPocketMoneyAmount('');
      setPocketMoneyFrequency('monthly');

      console.log(`[NOTIFIKACIJA RODITELJU]: Novi dječji račun za ${createdAccount.name} je kreiran!`);

      setTimeout(() => {
        setShowCreationForm(false);
        setMessage('');
      }, 2500);

    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getChildAvatar = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const openDetailsModal = (account) => {
    setSelectedChildAccount(account);
    setSendMoneyAmount('');
    setSendMoneyDescription('');
    setMessage('');
    setMessageType('');
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedChildAccount(null);
    setMessage('');
    setMessageType('');
  };

  const handleSendMoney = async () => {
    setMessage('');
    setMessageType('');

    if (!sendMoneyAmount || isNaN(parseFloat(sendMoneyAmount)) || parseFloat(sendMoneyAmount) <= 0) {
      setMessage('Molimo unesite valjan pozitivan iznos za slanje.');
      setMessageType('error');
      return;
    }

    if (!sendMoneyDescription.trim()) {
        setMessage('Molimo unesite opis za transakciju.');
        setMessageType('error');
        return;
    }

    setIsLoading(true);

    const amountToSend = parseFloat(sendMoneyAmount);
    const transactionDescription = sendMoneyDescription.trim();

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setChildrenAccounts(prevAccounts =>
        prevAccounts.map(account =>
          account.id === selectedChildAccount.id
            ? {
                ...account,
                balance: account.balance + amountToSend,
                transactions: [
                  {
                    id: account.transactions.length + 1,
                    description: transactionDescription,
                    amount: amountToSend,
                    date: new Date().toISOString().slice(0, 10),
                    type: 'in'
                  },
                  ...account.transactions,
                ],
                savingsGoal: {
                    ...account.savingsGoal,
                    current: Math.min(account.savingsGoal.target, account.savingsGoal.current + amountToSend)
                }
              }
            : account
        )
      );

      setMessage('Novac uspješno poslan!');
      setMessageType('success');
      setSendMoneyAmount('');
      setSendMoneyDescription('');

      console.log(`[NOTIFIKACIJA RODITELJU]: Poslano ${amountToSend.toFixed(2)} Euro na račun djeteta ${selectedChildAccount.name}.`);

    } catch (error) {
      setMessage('Greška pri slanju novca. Pokušajte ponovno.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kids-section content-section" id="kids-accounts">
      <h2>Dječji računi</h2>
      <p className="section-description">
        Kreirajte i upravljajte financijama svoje djece. Poučite ih o novcu na zabavan i siguran način.
      </p>

      {!showCreationForm && (
        <div className="account-overview-section">
          {childrenAccounts.length === 0 ? (
            <div className="no-accounts-message">
              <p>Trenutno nemate otvorenih dječjih računa.</p>
              <button className="cta-button" onClick={() => setShowCreationForm(true)}>
                Otvori novi dječji račun
              </button>
            </div>
          ) : (
            <>
              <div className="existing-accounts-grid">
                {childrenAccounts.map(account => (
                  <div key={account.id} className="child-account-card">
                    <div className="child-avatar">{getChildAvatar(account.name)}</div>
                    <div className="account-details">
                      <h3>{account.name}</h3>
                      <p>Stanje: <span className="account-balance">{account.balance.toFixed(2)} Euro</span></p>
                      <button className="details-button" onClick={() => openDetailsModal(account)}>Detalji & Upravljanje</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="cta-button add-new-account-button" onClick={() => setShowCreationForm(true)}>
                + Otvori novi dječji račun
              </button>
            </>
          )}
        </div>
      )}

      {showCreationForm && (
        <div className="account-creation-form-container">
          <h3>Kreiraj novi dječji račun</h3>
          <form onSubmit={handleCreateAccount} className="creation-form">
            <div className="form-group">
              <label htmlFor="childName">Ime djeteta:</label>
              <input
                type="text"
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Npr. Ana"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="childDob">Datum rođenja:</label>
              <input
                type="date"
                id="childDob"
                value={childDob}
                onChange={(e) => setChildDob(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="initialDeposit">Početni depozit (Euro, opcionalno):</label>
              <input
                type="number"
                id="initialDeposit"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                placeholder="Npr. 500"
                min="0"
                step="0.01"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dailyLimit">Dnevni limit potrošnje (Euro, opcionalno):</label>
              <input
                type="number"
                id="dailyLimit"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="Npr. 200"
                min="0"
                step="0.01"
                disabled={isLoading}
              />
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="allowOnlineSpending"
                checked={allowOnlineSpending}
                onChange={(e) => setAllowOnlineSpending(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="allowOnlineSpending">Dozvoli online potrošnju</label>
            </div>

            <div className="form-group pocket-money-group">
              <label htmlFor="pocketMoneyAmount">Džeparac (Euro, opcionalno):</label>
              <input
                type="number"
                id="pocketMoneyAmount"
                value={pocketMoneyAmount}
                onChange={(e) => setPocketMoneyAmount(e.target.value)}
                placeholder="Npr. 100"
                min="0"
                step="0.01"
                disabled={isLoading}
              />
              <select
                id="pocketMoneyFrequency"
                value={pocketMoneyFrequency}
                onChange={(e) => setPocketMoneyFrequency(e.target.value)}
                disabled={isLoading}
              >
                <option value="daily">Dnevno</option>
                <option value="weekly">Tjedno</option>
                <option value="monthly">Mjesečno</option>
              </select>
            </div>

            {message && (
              <div className={`form-message ${messageType}`}>
                {message}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowCreationForm(false);
                  setMessage('');
                  setMessageType('');
                  setIsLoading(false);
                }}
                disabled={isLoading}
              >
                Odustani
              </button>
              <button type="submit" className="cta-button" disabled={isLoading}>
                {isLoading ? 'Kreiram...' : 'Kreiraj račun'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isDetailsModalOpen && selectedChildAccount && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeDetailsModal} disabled={isLoading}>&times;</button>
            <h3>Detalji računa: {selectedChildAccount.name}</h3>

            <div className="child-account-details-modal-content">
                <p>Trenutno stanje: <span className="account-balance-large">{selectedChildAccount.balance.toFixed(2)} Euro</span></p>

                <div className="send-money-section">
                    <h4>Pošalji novac</h4>
                    <div className="input-group">
                        <label htmlFor="sendMoneyAmount">Iznos (Euro):</label>
                        <input
                            type="number"
                            id="sendMoneyAmount"
                            value={sendMoneyAmount}
                            onChange={(e) => setSendMoneyAmount(e.target.value)}
                            placeholder="Npr. 1000"
                            min="0"
                            step="0.01"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="sendMoneyDescription">Opis transakcije:</label>
                        <input
                            type="text"
                            id="sendMoneyDescription"
                            value={sendMoneyDescription}
                            onChange={(e) => setSendMoneyDescription(e.target.value)}
                            placeholder="Npr. za knjige ili džeparac"
                            disabled={isLoading}
                        />
                    </div>
                    <button className="cta-button" onClick={handleSendMoney} disabled={isLoading}>
                        {isLoading ? 'Šaljem...' : 'Pošalji novac'}
                    </button>
                </div>

                {message && (
                    <div className={`form-message ${messageType}`}>
                        {message}
                    </div>
                )}

                {selectedChildAccount.savingsGoal && (
                    <div className="savings-goal-section">
                        <h4>Cilj štednje: {selectedChildAccount.savingsGoal.description}</h4>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${(selectedChildAccount.savingsGoal.current / selectedChildAccount.savingsGoal.target) * 100}%` }}
                            ></div>
                        </div>
                        <p className="progress-text">
                            {selectedChildAccount.savingsGoal.current.toFixed(2)} / {selectedChildAccount.savingsGoal.target.toFixed(2)} Euro
                            ({((selectedChildAccount.savingsGoal.current / selectedChildAccount.savingsGoal.target) * 100).toFixed(0)}%)
                        </p>
                    </div>
                )}

                <div className="transaction-history-section">
                    <h4>Povijest transakcija</h4>
                    {selectedChildAccount.transactions.length === 0 ? (
                        <p className="no-transactions">Trenutno nema transakcija.</p>
                    ) : (
                        <ul className="transaction-list">
                            {selectedChildAccount.transactions.map(t => (
                                <li key={t.id} className={`transaction-item ${t.type}`}>
                                    <span className="transaction-date">{t.date}</span>
                                    <span className="transaction-description">{t.description}</span>
                                    <span className="transaction-amount">
                                        {t.type === 'in' ? '+' : ''}{t.amount.toFixed(2)} Euro
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kids;