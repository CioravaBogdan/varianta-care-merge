// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import LocaleSelector from './LocaleSelector';

function Navbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useUser();

  return (
    <nav style={{
      padding: '1rem',
      background: '#f8f9fa',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div>
          <Link to="/dashboard" style={{ marginRight: '1rem' }}>{t('dashboard')}</Link>
          <Link to="/history" style={{ marginRight: '1rem' }}>{t('history')}</Link>
          <Link to="/profile" style={{ marginRight: '1rem' }}>{t('profile')}</Link>
        </div>
        <LocaleSelector />
      </div>
      <button
        onClick={() => {
          signOut();
          navigate('/');
        }}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          background: '#dc3545',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        {t('logout')}
      </button>
    </nav>
  );
}

export default Navbar;
