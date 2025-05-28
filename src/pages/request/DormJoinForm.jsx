import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const DormJoinForm = ({ code }) => {
  const [dormName, setDormName] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const [Loading, setLoading] = useState(true);

  useEffect(() => {
  setLoading(true);
  const fetchDorm = async () => {
    try {
      const res = await api.get(`/dorm/info-by-code/${code}`);
      setDormName(res.data.name);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'ไม่พบหอพัก',
        text: 'ไม่พบหอพักจากรหัสนี้',
      }).then(() => navigate('/dashboard'));
    }
  };

  fetchDorm();
}, [code]);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!fullName) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณากรอกชื่อ-นามสกุล',
    });
    return;
  }

  try {
    await api.post('/request/join', {
      fullName,
      code
    });
    Swal.fire({
      icon: 'success',
      title: 'ส่งคำขอเรียบร้อยแล้ว',
      text: 'ระบบได้ส่งคำขอเข้าร่วมหอพักของคุณแล้ว',
    }).then(() => navigate('/'));
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: err.response?.data?.message || 'ไม่สามารถส่งคำขอได้',
    });
  }
};

  return (
    <div className='dorm-join-page'>
      {dormName && (
        <div className='dorm-join-page-form'>
          <button onClick={() => navigate(-1)} className='go-back-button'> <FontAwesomeIcon icon={faChevronLeft}/> ย้อนกลับ</button>
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
            <button type="submit" className="mybtn btn-black btn-full-width">ส่งคำขอ</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DormJoinForm;
