import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TenantQRCode = () => {

  const [code, setCode] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();

  const userID = 1; // mocked userID

  useEffect(() => {
    if (!id) return;

    const fetchCode = async () => {
      try {
        const res = await api.post('/dorm-user/getUserCode', {
          userID,
          id,
        });
        setCode(res.data.code);
      } catch (err) {
        console.error('Failed to fetch code:', err);
      }
    };

    fetchCode();
  }, [id]);

  return (
    <div>
      <h2>QR Code รับพัสดุ</h2>
      <p>ใช้สำหรับแสดงให้เจ้าหน้าที่ สำหรับการยืนยันการรับพัสดุ</p>
      <div style={{ marginTop: '20px' }}>
        {code && <QRCode value={code} />}
      </div>
      <p>รหัส Code: {code || 'ไม่พบโค้ด'}</p>

      <button className="mybutton" onClick={() => navigate(`/dorm/${id}/mypackage`)}>
        กลับไปหน้าพัสดุของฉัน
      </button>
    </div>
  );
};

export default TenantQRCode;
