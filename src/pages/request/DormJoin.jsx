import React, { useState } from 'react';
import DormJoinForm from './DormJoinForm'; 
import { useNavigate } from 'react-router-dom';
import PackageScanner from '../packager/PackageScanner';

const QrPage = () => {
  const [userCode, setUserCode] = useState('');

  const navigate = useNavigate();

  return (
    <>
      {!userCode ? (
        <PackageScanner
          onDetected={(code) => setUserCode(code)}
          onClose={() => navigate('/dashboard')} 
        />
      ) : (
        <DormJoinForm code={userCode} />
      )}
    </>
  );
};

export default QrPage;


