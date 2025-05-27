import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import api from '../../utils/api';

const DormQRCode = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const fetchInviteCode = async () => {
      try {
        const res = await api.get(`/dorm/info/${id}`);
        setInviteCode(res.data.inviteCode);
      } catch (err) {
        console.error('Error fetching invite code:', err);
      }
    };

    fetchInviteCode();
  }, [id]);

  return (
    <div className='qr-content'>
      <h2>QR Code ของหอพัก</h2>
      <p>ใช้สำหรับการเข้าร่วมหอพัก</p>
      {inviteCode ? (
        <>
          <div style={{ marginTop: "20px" }}>
            <QRCode value={inviteCode} />
          </div>
          <p>รหัส Code: {inviteCode}</p>
        </>
      ) : (
        <p>กำลังโหลด...</p>
      )}
      <button className='mybutton' onClick={() => navigate('/')}>กลับไปหน้าหลัก</button>
    </div>
  );
};

export default DormQRCode;
