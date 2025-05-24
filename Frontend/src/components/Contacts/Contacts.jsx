import React, { useState } from 'react';
import './Contacts.css';

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

  const openModal = (user) => {
    setSelectedUser(user);
    setAmount('');
    setDescription('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Potvrda akcije (dodaj/zatraži novac)
  const handleConfirmAction = (actionType) => {
    if (!amount || isNaN(parseFloat(amount))) {
      alert('Molimo unesite valjan iznos.');
      return;
    }

    const summary = `
      Korisnik: ${selectedUser.name}
      Akcija: ${actionType === 'add' ? 'Dodaj novac' : 'Zatraži novac'}
      Iznos: ${parseFloat(amount).toFixed(2)} Euro
      Opis: ${description || 'Nema opisa'}
    `;
    alert(summary);
    closeModal();
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
            <button className="modal-close-button" onClick={closeModal}>&times;</button>
            <h3>Financijska transakcija za {selectedUser.name}</h3>
            <div className="modal-body">
              <div className="input-group">
                <label htmlFor="amount-input">Iznos (Euro):</label>
                <input
                  id="amount-input"
                  type="number"
                  placeholder="Unesite iznos"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="input-group">
                <label htmlFor="description-input">Opis (neobavezno):</label>
                <textarea
                  id="description-input"
                  placeholder="Dodajte kratak opis transakcije"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cta-button add-button" onClick={() => handleConfirmAction('add')}>Dodaj novac</button>
              <button className="cta-button request-button" onClick={() => handleConfirmAction('request')}>Zatraži novac</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;