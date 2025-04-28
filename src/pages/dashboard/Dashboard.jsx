import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../../utils/api';
import UserQRCode from '../packager/userQRCode';
import SendEmailButton from './SendEmailButton';

const Dashboard = () => {
  const navigate = useNavigate();
  const userID = 1; //MOCK

  const [packages, setPackages] = useState([]);
  const [dorms, setDorms] = useState([]);

  const [showQrModal, setShowQrModal] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState('');

  useEffect(() => {
    fetchPackages();
    fetchDorms();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.post('/package/getByUserID', { userID });
      setPackages(res.data);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    }
  };

  const fetchDorms = async () => {
    try {
      const res = await api.post('/dorm-user/getByUserID', { userID });
      setDorms(res.data);
    } catch (err) {
      console.error('Failed to fetch dorms:', err);
    }
  };

  return (
    <div className='dashboard-container'>
      <h1>หน้าหลัก</h1>
      <p onClick={() => navigate('/test')}>go to test</p>
      <p>คุณมีรายการพัสดุที่รอการรับทั้งหมด {packages.length} ชิ้น</p>

      <div className="package-container">
        {packages.map(pkg => (
          <div className="package-card" key={pkg.id}>
            <div className="package-image">
              <img
                src={pkg.pathToPicture ? `${BASE_URL}${pkg.pathToPicture}` : `${BASE_URL}/packages/default.png`}
                alt="package"
              />
            </div>
            <div className="package-info">
              <p><strong>หอพัก {pkg.dormName} ห้องพัก {pkg.recipientRoomNo}</strong></p>
              <p>ผู้รับ: {pkg.recipientName}</p>
              <p>เข้าสู่ระบบเมื่อ: {new Date(pkg.registerTime).toLocaleString()}</p>
              <p>ผู้นำเข้าสู่ระบบ: {pkg.registerBy}</p>
            </div>
            <div className="package-action">
              <button className="qr-button" onClick={()=> {
                setSelectedPackage(pkg.id)
                setShowQrModal(true);
              }}>
                <FontAwesomeIcon icon={faQrcode} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className='flex-between-menu'>
        <p>หอพักของคุณ</p>
        <a onClick={() => navigate('/join-dorm')}>เข้าร่วมหอพัก</a>
        <a onClick={() => navigate('/create-dorm')}>สร้างหอพัก</a>
      </div>

      <div className="dorm-container">
        {dorms.map(dorm => (
          <div className="dorm-card" key={dorm.id}>
            <div className="dorm-image">
              <img src="/image/dorm1.jpg" alt="dorm" />
            </div>
            <div className="dorm-info">
              <p><strong>หอพัก {dorm.dormName}</strong></p>
              <p>คุณอยู่ในหอในบทบาท: {dorm.role}</p>
            </div>
            <div className="dorm-action">
              <button className="go-button" onClick={() => navigate(`/dorm/${dorm.dormID}`)}>
                ไปยังหอพัก
              </button>
            </div>
          </div>
        ))}
      </div>

      {showQrModal && (
        <UserQRCode id={selectedPackage} onClose={() => {
          setShowQrModal(false)
          setSelectedPackage('')
        }} />
      )}

      <SendEmailButton/>
    </div>
  );
};

export default Dashboard;
