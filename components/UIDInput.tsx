'use client';

import React, { useState } from 'react';

interface UIDInputProps {
    onSubmit: (uid: string) => void; 
    uid: string; // Add the 'uid' prop here
  }

  const UIDInput: React.FC<UIDInputProps> = ({ onSubmit, uid }) => {
    const [localUid, setLocalUid] = useState(uid); // Local state for the input field
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit(localUid); 
    };
    return (
      <form onSubmit={handleSubmit}>
        <label htmlFor="uid">Genshin UID:</label>
        <input
          type="text"
          id="uid"
          value={localUid} // Use the 'localUid' state here
          onChange={(e) => setLocalUid(e.target.value)}
        placeholder="Enter UID"
        autoComplete="on"
        className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-2 w-full max-w-md"
      />
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
      >
        Submit
      </button>
      </form>
    );
  };
  export default UIDInput;