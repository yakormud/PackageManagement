import React, { useState } from 'react';
import PackageScanner from './PackageScanner'; 

const AddPackage = () => {
  const [trackingNo, setTrackingNo] = useState('');

  return (
    <div style={{ padding: 20 }}>
      {!trackingNo ? (
        <PackageScanner
          onDetected={(code) => {
            setTrackingNo(code);
          }}
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
