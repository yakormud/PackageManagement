import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const DormJoinForm = ({ code }) => {
  const [dormName, setDormName] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const [Loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true)
    const fetchDorm = async () => {
      try {
        const res = await api.get(`/dorm/info-by-code/${code}`);
        setDormName(res.data.name);
        setLoading(false)
      } catch (err) {
        console.error(err);
        setLoading(false)
        alert('ไม่พบหอพักจากรหัสนี้');
        navigate('/dashboard')
      }
    };

    fetchDorm();
  }, [code]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName) {
      alert('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    try {
      await api.post('/request/join', {
        userID: 1,
        fullName,
        code
      });
      alert('ส่งคำขอเข้าร่วมหอพักเรียบร้อยแล้ว');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }

  };

  return (
    <div className='page-center'>
      {dormName && (
        <>
          <button onClick={() => navigate(-1)}>ย้อนกลับ</button>
          <h2>เข้าร่วมหอพัก {dormName}</h2>

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="fullName">ชื่อ-นามสกุล</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </div>
            <button type="submit" className="form-button">ส่งคำขอ</button>
          </form>
        </>
      )}
    </div>
  );
};

export default DormJoinForm;
