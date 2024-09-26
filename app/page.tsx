'use client';

import React, { useState } from 'react';
import UIDInput from '../components/UIDInput';
import { CharacterData } from '../types';
import './globals.css';

const HomePage = () => {
  const [uid] = useState('');
  const [characterData, setCharacterData] = useState<CharacterData[]>([]);

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
          values: item.slice(1), // Values array (assuming 5 values)
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
    <div className="container mx-auto p-4">
      <section className="hero flex items-center justify-center text-center bg-gray-100 py-12">
        <div className="hero-content">
          <h1 className="text-4xl font-bold text-white">Genshin Impact Artifact Analyzer</h1>
          <p className="mt-4 text-lg text-white">Analyze and enhance your character&apos;s artifact builds with Enka data.</p>
          <UIDInput uid={uid} onSubmit={handleUIDSubmit} />
        </div>
      </section>

      {characterData.length > 0 && (
        <section className="character-section py-8">
          <h2 className="text-3xl font-semibold text-center text-white">Character Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Character</th>
                  <th className="py-3 px-6 text-left">Flower</th>
                  <th className="py-3 px-6 text-left">Feather</th>
                  <th className="py-3 px-6 text-left">Sands</th>
                  <th className="py-3 px-6 text-left">Goblet</th>
                  <th className="py-3 px-6 text-left">Circlet</th>
                  <th className="py-3 px-6 text-left">Combined RV</th>
                </tr>
              </thead>
              <tbody>
                {characterData.map((character, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">{character.name}</td>
                    {character.values
                      .filter((_, i) => [0, 2, 4, 6, 8, 10].includes(i))
                      .map((value, i) => {
                        const colorIndex = [0, 2, 4, 6, 8, 10][i] + 1;
                        const color = character.values[colorIndex];
                        const backgroundColor = typeof color === 'string' ? color : 'transparent';
                        return (
                          <td key={i} className="py-3 px-6 text-left whitespace-nowrap" style={{ backgroundColor }}>
                            {value}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;