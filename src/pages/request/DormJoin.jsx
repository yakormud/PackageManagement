import React, { useState } from 'react';
import DormJoinForm from './DormJoinForm'; 
import { useNavigate } from 'react-router-dom';
import PackageScanner from '../packager/PackageScanner';

const QrPage = () => {
  const [userCode, setUserCode] = useState('');

  const navigate = useNavigate();

  return (
    <div className='scan-backdrop'>
      {!userCode ? (
        <PackageScanner
          onDetected={(code) => setUserCode(code)}
          onClose={() => navigate('/dashboard')} 
        />
      ) : (
        <DormJoinForm code={userCode} />
      )}
    </div>
  );
};

export default QrPage;


