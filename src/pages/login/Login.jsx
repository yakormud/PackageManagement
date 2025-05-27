import React, { useContext, useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import packagePic from '../../assets/package-icon.png'
import { AuthContext } from '../../AuthContext';
import Swal from 'sweetalert2';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username == 'dev') {
      localStorage.setItem('backend_url', password);
      alert(`Backend URL set to: ${password}`);
      window.location.reload();
      return;
    }

    try {
      const res = await api.post('/user/login', { username, password });

      //Save token ลง local storage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      login(res.data.user, res.data.token);

      await Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        text: 'ยินดีต้อนรับเข้าสู่ระบบ',
      });

      navigate('/dashboard');

    } catch (err) {
      console.error('Login failed:', err);
      const status = err.response?.status;

      if (status === 401) {
        await Swal.fire({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'Username หรือ รหัสผ่าน ไม่ถูกต้อง',
        });
      } else {
          await Swal.fire({
          icon: 'error',
          title: 'ล้มเหลว',
          text: 'เกิดข้อผิดพลาด',
        });
      }
    }
  };

  return (
    <div className="login-page">

      <div className='login-container'>
        <div className='icon-container'>
          <h2>ระบบจัดการพัสดุของหอพัก</h2>
          <p>DORMITORY PACKAGE MANAGEMENT SYSTEM</p>
          <img src={packagePic}></img>
        </div>

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
          <button type="submit" className="mybtn btn-full-width btn-black">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

