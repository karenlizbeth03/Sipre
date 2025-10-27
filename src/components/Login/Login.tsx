import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './Login.css';
import galaImg from '../../assets/GALA.png';

export type UserRole = 'super-admin' | 'admin' | 'user';

interface LoginProps {
  onLoginSuccess: (token: string, role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [ci, setCi] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'http://192.168.2.187:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ci, password }),
      });

      const loginData = await res.json();
      if (!res.ok || !loginData.data) throw new Error(loginData.message || 'Credenciales inválidas');

      const token = loginData.data;
      localStorage.setItem('token', token);

      const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const meData = await meRes.json();
      if (!meRes.ok || !meData.data) throw new Error(meData.message || 'No se pudo obtener el usuario');

      const roleName = meData.data.role?.name?.toLowerCase().trim() || 'user';
      let role: UserRole = 'user';
      if (roleName.includes('super')) role = 'super-admin';
      else if (roleName.includes('admin')) role = 'admin';

      localStorage.setItem('role', role);
      onLoginSuccess(token, role);

    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <img src={galaImg} alt="" style={{ maxWidth: '200px', width: '100%', borderRadius: '12px' }} />
        </div>
       


        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ci">Cédula</label>
            <input
              type="text"
              id="ci"
              placeholder="Ingrese su cédula"
              value={ci}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) setCi(value);
              }}
              required
            />
          </div>

          <div className="form-group password-field">
            <label htmlFor="password">Contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
};

export default Login;
