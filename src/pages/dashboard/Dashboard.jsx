import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../../utils/api';
import UserQRCode from '../packager/userQRCode';
import SendEmailButton from './SendEmailButton';
import packagePic from '../../assets/package-large.png'
import defaultPic from '../../assets/noimage.png'

const Dashboard = () => {
  const navigate = useNavigate();

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
      const res = await api.post('/package/getByUserID');
      setPackages(res.data);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    }
  };

  const fetchDorms = async () => {
    try {
      const res = await api.post('/dorm-user/getByUserID');
      setDorms(res.data);
      console.log(res.data)
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

      <h2>หอพักของคุณ</h2>

      <div className="dorm-container">
        {dorms.length == 0 && <p style={{textAlign:"center", width:"100%"}}>ขณะนี้คุณยังไม่มีหอพัก <br></br>คุณสามารถสร้างหรือเข้าร่วมหอพักได้ที่ปุ่ม "เมนู"</p>}
        {dorms.map(dorm => (
          <div className="dorm-card" key={dorm.id} onClick={() => navigate(`/dorm/${dorm.dormID}`)}>
            <div className="dorm-image">

                <img src={(dorm.pathToPicture != '' && dorm.pathToPicture != undefined) ? `${BASE_URL}${dorm.pathToPicture}` : defaultPic}></img>

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
    </div>
  );
};

export default Dashboard;
