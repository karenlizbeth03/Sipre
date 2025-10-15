import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
  onCancel?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://192.168.2.184:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const token = data.data; 
        if (!token) throw new Error('Token no recibido del servidor');

        localStorage.setItem('token', token); 
        onLoginSuccess(token); 
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Error de conexión con el servidor');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-form" style={{ position: 'relative' }}>
        <button
          className="login-close-btn"
          onClick={onCancel}
          title="Cerrar"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#888'
          }}
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password">Contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '35px' }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-0%)',
                cursor: 'pointer',
                color: '#666',
                fontSize: '20px'
              }}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <button type="submit">Ingresar</button>
        </form>
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
};

export default Login;
