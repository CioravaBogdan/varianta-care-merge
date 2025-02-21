import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';
import './Auth.css';

export function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      {isLogin ? (
        <Login switchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register switchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
}