import React from 'react';
import { useUser } from '../contexts/UserContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ro', name: 'Română' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'pl', name: 'Polski' }
];

const LocaleSelector = () => {
  const { userLanguage, setUserLanguage } = useUser();

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setUserLanguage(newLang);
    localStorage.setItem('userLanguage', newLang);
  };

  return (
    <select
      value={userLanguage}
      onChange={handleLanguageChange}
      style={{
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        backgroundColor: '#fff'
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

export default LocaleSelector;