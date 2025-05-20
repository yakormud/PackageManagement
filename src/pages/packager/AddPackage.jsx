import React, { useState } from 'react';
import PackageScanner from './PackageScanner'; 
import { useNavigate } from 'react-router-dom';

const AddPackage = () => {
  const [trackingNo, setTrackingNo] = useState('');
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      {!trackingNo ? (
        <PackageScanner
          onDetected={(code) => {
            setTrackingNo(code);
          }}
          onClose={ ()=> navigate(-1)}
        />
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>รหัสที่ได้</h2>
          <p>{trackingNo}</p>
          <button onClick={() => setTrackingNo('')}>ย้อนกลับไปแสกนใหม่</button>
        </div>
      )}
    </div>
  );
};

export default AddPackage;
