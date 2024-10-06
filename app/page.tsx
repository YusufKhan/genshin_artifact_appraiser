'use client';

import React, { useState } from 'react';
//import UIDInput from '../components/UIDInput';
//import { CharacterData } from '../types';
import './globals.css';
import performCalculation from '../pages/api/performCalculation';

const HomePage = () => {

  type Teams = {
    [key: string]: number[];
  };
  interface Character {
    name: string;
    values: number[];
  }

  const initialTeams: Teams = { //%gain for character damage from one AVERAGE roll
    //              HP      ATK     DEF     HP%     ATK%    DEF%    CR      CDMG    ER      EM 
    Alhatham:   [   0,      0.3,    0,      0,      0.8,    0,      2.2,    2.3,    0,      1.1     ],
    Arlecchino: [   0,      0.49,   0,      0,      1.51,   0,      2.95,   2.33,   0,      1.33    ],
    Hutao:      [   0.62,   0.5,    0,      1.88,   1.07,   0,      3.2,    2.16,   0,      2.36    ],
    Shougun:    [   0,      0.53,   0,      0,      1.34,   0,      2.92,   2.43,   1.1,    0       ],
    Fischl:     [   0,      0.63,   0,      0,      1.41,   0,      2.62,   2.88,   0,      1.43    ],
    Furina:     [   0.93,   0,      0,      2.78,   0,      0,      1.19,   2.58,   0,      0       ],
    Eula:       [   0,      0.79,   0,      0,      2.4,    0,      1.57,   2.36,   0,      0       ],
}
  const [uid, setUid] = useState(''); // Define the uid state
  const [teams, setTeams] = useState<Teams>(initialTeams);
  const [characterData, setCharacterData] = useState<Character[]>([]); // Define the type for characterData

  const handleChange = (character: string, index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setTeams((prevTeams) => {
      const updatedCharacter = [...prevTeams[character]];
      updatedCharacter[index] = parseFloat(newValue);
      return { ...prevTeams, [character]: updatedCharacter };
    });
  };

  const handleUIDSubmit = async (uid: string) => {
    try {
      const data = await performCalculation(uid, teams);
      console.log('Response data:', data); // Log the response data to verify its structure

      const formattedData = data.result.map((item: string[]) => ({
        name: item[0],
        values: item.slice(1).map(Number), // Ensure values are numbers
      }));
      setCharacterData(formattedData);

      if (data.teams) {
        setTeams(data.teams); // Ensure the teams data is correctly set
      } else {
        console.error('Teams data is missing in the response');
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
          <input
            type="text"
            placeholder="Enter UID"
            value={uid}
            onChange={(event) => setUid(event.target.value)} // Update the uid state
        autoComplete="on"
        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-2 w-full max-w-md"
      />
       <button onClick={() => handleUIDSubmit(uid)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Submit
      </button>

      {/* </div></form> */}
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
                    {character.values.map((value, i) => {
                    /* if (i === 0) {
                      // Render the first value with a transparent background
                      return (
                        <td key={i} className="py-3 px-6 text-left whitespace-nowrap" style={{ backgroundColor: 'transparent' }}>
                          {value}
                        </td>
                      );
                    } else { */
                        const red = 255-Number(value)/100*255; //Math.min(255, Math.max(0, Math.round(255 * (Number(value)))));
                        const green = Number(value)/100*255; //Math.min(255, Math.max(0, Math.round(255 * (Number(value)))));
                        const alpha = 1-Number(value)/100; // Scale opacity based on value
                        const color = `rgba(${red},${green},0,${alpha})`;
                        //const backgroundColor = typeof color === 'string' ? color : 'transparent';
                        return (
                          <td key={i} className="py-3 px-6 text-center whitespace-nowrap" style={{ backgroundColor:color }}>
                            {value}
                          </td>
                        );
                      //}
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <h2 className="mt-4 text-3xl font-semibold text-center text-white">Editable Weights</h2>
        <div className="overflow-x-auto">
        {characterData.length > 0 &&  (
            <table className="min-w-full table-auto bg-blue shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-900 uppercase leading-normal">
                  <th className="py-3 px-6 text-left">Character</th>
                  <th className="py-3 px-6 text-left">HP</th>
                  <th className="py-3 px-6 text-left">ATK</th>
                  <th className="py-3 px-6 text-left">DEF</th>
                  <th className="py-3 px-6 text-left">HP%</th>
                  <th className="py-3 px-6 text-left">ATK%</th>
                  <th className="py-3 px-6 text-left">DEF%</th>
                  <th className="py-3 px-6 text-left">CR</th>
                  <th className="py-3 px-6 text-left">CDMG</th>
                  <th className="py-3 px-6 text-left">ER</th>
                  <th className="py-3 px-6 text-left">EM</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(teams).map(([character, values], characterIndex) => (
                  <tr key={characterIndex}>
                    <td className="py-2 px-4 text-white text-sm text-center align-top">{character}</td>
                    {values.map((value, index) => (
                      <td key={index} className="p-0 align-top">
                        <input
                          type="text"
                          value={value}
                          onChange={(event) => handleChange(character, index, event)}
                          className="w-full h-full border text-white text-center m-0"
                          style={{ backgroundColor: '#08192b', fontSize: '0.875rem', borderRadius: '0', height: '100%' }} // Custom styles for text size and padding
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
    </div>
  );
};

export default HomePage;