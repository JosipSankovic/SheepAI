import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fall = keyframes`
  from {
    transform: translateY(-100px);
    opacity: 1;
  }
  to {
    transform: translateY(180px);
    opacity: 0;
  }
`;

const PiggyBankContainer = styled.div`
  position: relative;
  width: 300px;
  height: 220px;
  margin: 50px auto;
`;

const Pig = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 240px;
  height: 140px;
  background: #ff9ec4;
  border-radius: 120px 120px 80px 80px;
  transform: translateX(-50%);
  box-shadow: inset -10px 0 0 rgba(0,0,0,0.1);
`;

const Slot = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  width: 80px;
  height: 8px;
  background: #663;
  border-radius: 4px;
  transform: translateX(-50%);
`;

const Ear = styled.div`
  position: absolute;
  top: -20px;
  width: 60px;
  height: 60px;
  background: #ff9ec4;
  border-radius: 50%;
  border: 4px solid #e3779c;
  ${({ side }) => side === 'left' ? 'left: 30px; transform: rotate(-30deg);' : 'right: 30px; transform: rotate(30deg);'}
`;

const Snout = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  width: 80px;
  height: 50px;
  background: #ff7fbf;
  border-radius: 50%;
  transform: translateX(-50%);
  &::before, &::after {
    content: '';
    position: absolute;
    top: 20px;
    width: 12px;
    height: 12px;
    background: #e3669a;
    border-radius: 50%;
  }
  &::before { left: 20px; }
  &::after { right: 20px; }
`;

const Eye = styled.div`
  position: absolute;
  top: 30px;
  width: 14px;
  height: 14px;
  background: #000;
  border-radius: 50%;
  ${({ side }) => side === 'left' ? 'left: 80px;' : 'right: 80px;'}
`;

const Leg = styled.div`
  position: absolute;
  bottom: -10px;
  width: 30px;
  height: 30px;
  background: #ff9ec4;
  border-radius: 50%;
  ${({ side }) => side === 'left' ? 'left: 60px;' : 'right: 60px;'}
`;

const Coin = styled.div`
  position: absolute;
  top: -30px;
  left: ${({ x }) => x}%;
  width: 24px;
  height: 24px;
  background: radial-gradient(circle at 40% 40%, #ffe066, #f0a500);
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(0,0,0,0.3);
  animation: ${fall} 1.8s ease-in forwards;
`;

const PiggyBank = () => {
  const [balance, setBalance] = useState(0);
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const x = Math.random() * 60 + 20;
      setCoins(cs => [...cs, { id, value: 1, x }]);
    }, 2000); // dodaje novčić svakih 2 sekunde

    return () => clearInterval(interval);
  }, []);

  const handleAnimationEnd = (coin) => {
    setCoins(cs => cs.filter(c => c.id !== coin.id));
    setBalance(b => b + coin.value);
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <PiggyBankContainer>
        <Pig>
          <Slot />
          <Ear side="left" />
          <Ear side="right" />
          <Eye side="left" />
          <Eye side="right" />
          <Snout />
          <Leg side="left" />
          <Leg side="right" />
        </Pig>
        {coins.map(coin => (
          <Coin
            key={coin.id}
            x={coin.x}
            onAnimationEnd={() => handleAnimationEnd(coin)}
          />
        ))}
      </PiggyBankContainer>
      <p style={{ fontSize: '24px', margin: '20px 0' }}>Stanje: {balance}</p>
    </div>
  );
};

export default PiggyBank;
