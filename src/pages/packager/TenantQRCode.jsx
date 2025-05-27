import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TenantQRCode = () => {

  const [code, setCode] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchCode = async () => {
      try {
        const res = await api.post('/dorm-user/getUserCode', {
          dormID: id ,
        });
        setCode(res.data.code);
      } catch (err) {
        console.error('Failed to fetch code:', err);
      }
    };

    fetchCode();
  }, [id]);

  return (
    <div className='page-content tenant-page'>
      <h2>QR Code รับพัสดุ</h2>
      <p>ใช้สำหรับแสดงให้เจ้าหน้าที่ยืนยันตัวตน</p>
      <p>สำหรับการเข้ารับพัสดุ</p>
      <div style={{ marginTop: '20px' }}>
        {code && <QRCode value={code} />}
      </div>
      <p style={{margin:"10px 0px"}}>รหัส Code: {code || 'ไม่พบโค้ด'}</p>

      <button className="mybtn" style={{marginTop:"30px"}} onClick={() => navigate(`/dorm/${id}/mypackage`)}>
        กลับไปหน้าพัสดุของฉัน
      </button>
    </div>
  );
};

export default TenantQRCode;
