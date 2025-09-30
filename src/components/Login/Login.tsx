import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
  onCancel?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://192.168.2.165:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        onLoginSuccess('success');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-form" style={{ position: 'relative' }}>
        <button
          className="login-close-btn"
          onClick={onCancel}
          title="Cerrar"
          style={{ position: 'absolute', top: 18, right: 18, background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888' }}
        >
          ×
        </button>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Usuario</label>
            <input
              type="text"
              id="email"
              placeholder="Ingrese su usuario"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Ingresar</button>
        </form>
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
};

export default Login;
