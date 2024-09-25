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
          type="number"
          id="uid"
          value={localUid} // Use the 'localUid' state here
          onChange={(e) => setLocalUid(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    );
  };
  export default UIDInput;