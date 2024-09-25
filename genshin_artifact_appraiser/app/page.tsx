'use client';

import React, { useState } from 'react';
import UIDInput from '../components/UIDInput';
import { CharacterData } from '../types';
import './globals.css';

const HomePage = () => {
  const [uid] = useState('');
  const [characterData, setCharacterData] = useState<CharacterData[]>([]); // Use an empty array

  const handleUIDSubmit = async (uid: string) => {
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });

      if (response.ok) {
        const data = await response.json();
        const formattedData = data.result.map((item: string[]) => ({
          name: item[0],
          values: item.slice(1),
        }));
        setCharacterData(formattedData);
      } else {
        console.error('Error submitting UID:', response.status);
      }
    } catch (error) {
      console.error('Error submitting UID:', error);
    }
  };

  return (
    <div>
      <UIDInput uid={uid} onSubmit={handleUIDSubmit} />

      {characterData.length > 0 && (
        <div>
          <h2>Character Data:</h2>
          {characterData.map((character, index) => (
            <div key={index}>
              <h3>{character.name}</h3>
              <pre>{character.values.join("\t")}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;