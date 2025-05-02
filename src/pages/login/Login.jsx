import React, { useContext, useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../../AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/user/login', { username, password });

      //Save token ลง local storage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      login(res.data.user, res.data.token);

      alert('Successful Login');
      navigate('/dashboard');

    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed');
    }
  };

  return (
    <div className="login-container">
      
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">เข้าสู่ระบบ</h2>

        <label htmlFor="username">Username</label>
        <input
          id='username'
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id='password'
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <a onClick={() => navigate('/register')}>สมัครสมาชิก</a>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default Login;

