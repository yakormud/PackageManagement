import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      await Swal.fire({
        icon: 'info',
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณาตรวจสอบใหม่อีกครั้ง',
      });
      return;
    }

    try {
      const res = await api.post('/user/register', { username, password, email });
      await Swal.fire({
        icon: 'success',
        title: 'สมัครสมาชิกสำเร็จ',
        text: 'ยินดีต้อนรับเข้าสู่ระบบ',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      await Swal.fire({
        icon: 'error',
        title: 'ล้มเหลว',
        text: err?.response?.data?.message || 'เกิดข้อผิดพลาด',
      });
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">สมัครสมาชิก</h2>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          className="login-input"
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="login-input"
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          className="login-input"
          placeholder='Confirm Password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="login-input"
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <a onClick={() => navigate('/login')}>เข้าสู่ระบบ</a>
        <button type="submit" className="mybtn btn-full-width btn-black">Register</button>
      </form>
    </div>
  );
};

export default Register;
