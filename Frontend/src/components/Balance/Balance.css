import React, { useState } from 'react';
import styled from 'styled-components';

// Kontejner za kasicu prasicu
const PiggyBankContainer = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 50px auto;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
`;

// Stil za novčić s animacijom pada
const Coin = styled.div`
  position: absolute;
  top: -50px;
  left: ${() => `${Math.random() * 80 + 10}%`}; // Nasumična x-pozicija unutar kasice
  animation: fall 2s linear forwards;

  @keyframes fall {
    from {
      transform: translateY(-100px);
    }
    to {
      transform: translateY(250px);
    }
  }
`;

// Stil za prikaz kasice (placeholder, može se zamijeniti SVG-om)
const PiggyImage = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 150px;
  background-color: #ff99cc;
  border-radius: 50% 50% 0 0;
`;

const PiggyBank = () => {
  const [balance, setBalance] = useState(0);
  const [coins, setCoins] = useState([]);

  // Funkcija za dodavanje novčića
  const addCoin = () => {
    const newCoin = { id: Date.now(), value: 1 };
    setCoins(prevCoins => [...prevCoins, newCoin]);
  };

  // Funkcija za rukovanje krajem animacije
  const handleAnimationEnd = (coin) => {
    setCoins(prevCoins => prevCoins.filter(c => c.id !== coin.id));
    setBalance(prevBalance => prevBalance + coin.value);
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <PiggyBankContainer>
        <PiggyImage /> {/* Placeholder za kasicu */}
        {coins.map(coin => (
          <Coin key={coin.id} onAnimationEnd={() => handleAnimationEnd(coin)}>
            <svg width="20" height="20">
              <circle cx="10" cy="10" r="10" fill="gold" />
            </svg>
          </Coin>
        ))}
      </PiggyBankContainer>
      <p style={{ fontSize: '24px', margin: '20px 0' }}>Stanje: {balance}</p>
      <button
        onClick={addCoin}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Dodaj novčić
      </button>
    </div>
  );
};

export default PiggyBank;