import React from 'react';
import { useUser } from '../contexts/UserContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ro', name: 'Română' },
  { code: 'de', name: 'Deutsch' },
  // Add more languages as needed
];

export const LanguageSelector = () => {
  const { userLanguage, setUserLanguage } = useUser();

  return (
    <select
      value={userLanguage}
      onChange={(e) => setUserLanguage(e.target.value)}
      style={{
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd'
      }}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};