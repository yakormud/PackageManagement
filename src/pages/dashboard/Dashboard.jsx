import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../../utils/api';
import UserQRCode from '../packager/userQRCode';
import SendEmailButton from './SendEmailButton';
import packagePic from '../../assets/package-large.png'
import hotelPic from '../../../image/dorm1.png'
import hotelPic2 from '../../../image/dorm2.png'

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
      <h2>หน้าหลัก</h2>
      <div className='dashboard-package-container'>
        <div className="flex-between-menu" style={{width:"100%"}}>
          <div className='package-title'>
            <p>จำนวนพัสดุที่ยังไม่ได้รับ</p>
            <h1>{packages.length} รายการ</h1> 

          </div>
          <img src={packagePic}></img>
        </div>
        <div className='mybtn btn-peel' onClick={() => navigate('/mypackage')}>ไปยังหน้ารวมพัสดุของฉัน <FontAwesomeIcon icon={faArrowRight}/></div>
      </div>

      {/* <div className="package-container">
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
      </div> */}

      <h2>หอพักของคุณ</h2>

      {/* <div className='flex-between-menu'>
        <p>หอพักของคุณ</p>
        <a onClick={() => navigate('/join-dorm')}>เข้าร่วมหอพัก</a>
        <a onClick={() => navigate('/create-dorm')}>สร้างหอพัก</a>
      </div> */}

      <div className="dorm-container">
        {dorms.map(dorm => (
          <div className="dorm-card" key={dorm.id} onClick={() => navigate(`/dorm/${dorm.dormID}`)}>
            <div className="dorm-image">
              {dorm.id == 2 ? (
                <img src={hotelPic2} alt="dorm" />
              ) : (
                <img src={hotelPic} alt="dorm" />
              )}
            </div>
            <div className="dorm-info">
              <p>{dorm.dormName}</p>
              <div className="mybtn btn-icon btn-black"><FontAwesomeIcon icon={faArrowRight}/></div>
            </div>
          </div>
        ))}
        {dorms.map(dorm => (
          <div className="dorm-card" key={dorm.id} onClick={() => navigate(`/dorm/${dorm.dormID}`)}>
            <div className="dorm-image">
              {dorm.id == 2 ? (
                <img src={hotelPic2} alt="dorm" />
              ) : (
                <img src={hotelPic} alt="dorm" />
              )}
            </div>
            <div className="dorm-info">
              <p>{dorm.dormName}</p>
              <div className="mybtn btn-icon btn-black"><FontAwesomeIcon icon={faArrowRight}/></div>
            </div>
          </div>
        ))}
        {dorms.map(dorm => (
          <div className="dorm-card" key={dorm.id} onClick={() => navigate(`/dorm/${dorm.dormID}`)}>
            <div className="dorm-image">
              {dorm.id == 2 ? (
                <img src={hotelPic2} alt="dorm" />
              ) : (
                <img src={hotelPic} alt="dorm" />
              )}
            </div>
            <div className="dorm-info">
              <p>{dorm.dormName}</p>
              <div className="mybtn btn-icon btn-black"><FontAwesomeIcon icon={faArrowRight}/></div>
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
