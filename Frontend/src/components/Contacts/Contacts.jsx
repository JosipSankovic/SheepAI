import React, { useState } from 'react';
import './Contacts.css';

// Hardkodirani korisnici
const initialUsers = [
  { id: '1', name: 'Ana Horvat', avatar: null },
  { id: '2', name: 'Marko Perić', avatar: null },
  { id: '3', name: 'Ivana Kovač', avatar: null },
  { id: '4', name: 'Petar Novak', avatar: null },
  { id: '5', name: 'Maja Marić', avatar: null },
  { id: '6', name: 'Ivan Horvat', avatar: null },
  { id: '7', name: 'Sara Babić', avatar: null },
  { id: '8', name: 'Luka Jurić', avatar: null },
  { id: '9', name: 'Ena Popović', avatar: null },
  { id: '10', name: 'Dino Knežević', avatar: null },
];

const Contact = () => {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Novo stanje za učitavanje
  const [transactionMessage, setTransactionMessage] = useState(''); // Novo stanje za poruke o transakciji
  const [messageType, setMessageType] = useState(''); // 'success' ili 'error'

  // Funkcija za upload avatara
  const handleAvatarUpload = (event, userId) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, avatar: reader.result } : user
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Otvaranje modala
  const openModal = (user) => {
    setSelectedUser(user);
    setAmount('');
    setDescription('');
    setTransactionMessage(''); // Resetiraj poruke pri otvaranju
    setMessageType('');
    setIsModalOpen(true);
  };

  // Zatvaranje modala
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setTransactionMessage('');
    setMessageType('');
  };

  // Simulacija API poziva
  const simulateApiCall = (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simuliramo nasumični uspjeh/neuspjeh
        const success = Math.random() > 0.3; // 70% šanse za uspjeh

        if (success) {
          resolve({ status: 'success', message: 'Transakcija uspješno obrađena.' });
        } else {
          reject({ status: 'error', message: 'Došlo je do greške prilikom obrade transakcije.' });
        }
      }, 1500); // Simuliramo 1.5 sekundi kašnjenja mreže
    });
  };

  // Potvrda akcije (dodaj/zatraži novac)
  const handleConfirmAction = async (actionType) => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setTransactionMessage('Molimo unesite valjan pozitivan iznos.');
      setMessageType('error');
      return;
    }

    setIsLoading(true); // Prikaži stanje učitavanja
    setTransactionMessage(''); // Resetiraj poruke
    setMessageType('');

    const transactionData = {
      userId: selectedUser.id,
      userName: selectedUser.name,
      action: actionType,
      amount: parseFloat(amount).toFixed(2),
      description: description || 'Nema opisa',
    };

    try {
      const response = await simulateApiCall(transactionData);
      setTransactionMessage(response.message);
      setMessageType('success');
      console.log('Simulirani API uspjeh:', response.message, transactionData);

    } catch (error) {
      setTransactionMessage(error.message);
      setMessageType('error');
      console.error('Simulirana API greška:', error.message, transactionData);

    } finally {
      setIsLoading(false); // Sakrij stanje učitavanja
      setTimeout(() => {
        closeModal();
      }, 2000); // Zatvori modal nakon 2 sekunde
    }
  };

  return (
    <div className="kontakti-section content-section" id="kontakti">
      <h2>Moji kontakti</h2>
      <p className="section-description">
        Upravljajte svojim financijskim interakcijama s povjerenjem.
      </p>
      <div className="kontakti-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <label htmlFor={`avatar-upload-${user.id}`} className="avatar-wrapper">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar" />
              ) : (
                <div className="user-initials">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <input
                type="file"
                id={`avatar-upload-${user.id}`}
                className="avatar-upload-input"
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e, user.id)}
              />
              <span className="upload-icon" title="Učitaj avatar">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="20" height="20">
                    <path d="M19 12v7H5v-7H3v7a2 2 0 002 2h14a2 2 0 002-2v-7h-2zm-6 2.828l3.121-3.121a1 1 0 00-1.414-1.414L13 12.172V3a1 1 0 00-2 0v9.172l-1.707-1.707a1 1 0 00-1.414 1.414L11 14.828V12a1 1 0 002 0v2.828z"/>
                </svg>
              </span>
            </label>
            <h3>{user.name}</h3>
            <button className="action-button" onClick={() => openModal(user)}>
              Pošalji / Zatraži
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal} disabled={isLoading}>&times;</button>
            <h3>Financijska transakcija za {selectedUser.name}</h3>
            <div className="modal-body">
              <div className="input-group">
                <label htmlFor="amount-input">Iznos u eurima:</label>
                <input
                  id="amount-input"
                  type="number"
                  placeholder="Unesite iznos"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>
              <div className="input-group">
                <label htmlFor="description-input">Opis (neobavezno):</label>
                <textarea
                  id="description-input"
                  placeholder="Dodajte kratak opis transakcije"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                ></textarea>
              </div>

              {transactionMessage && (
                <div className={`transaction-message ${messageType}`}>
                  {transactionMessage}
                </div>
              )}

            </div>
            <div className="modal-footer">
              <button
                className="cta-button add-button"
                onClick={() => handleConfirmAction('add')}
                disabled={isLoading}
              >
                {isLoading ? 'Šaljem...' : 'Dodaj novac'}
              </button>
              <button
                className="cta-button request-button"
                onClick={() => handleConfirmAction('request')}
                disabled={isLoading}
              >
                {isLoading ? 'Tražim...' : 'Zatraži novac'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;