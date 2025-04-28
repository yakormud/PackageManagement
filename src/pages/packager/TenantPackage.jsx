import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api , { BASE_URL} from '../../utils/api';

const TenantPackage = () => {
  const { id } = useParams(); // dormID from URL
  const [selectedStatus, setSelectedStatus] = useState('wait_for_deliver');
  const [packages, setPackages] = useState([]);

  const userID = 1; //MOCK

  const navigate = useNavigate();

  const fetchPackages = async () => {
    try {
      const res = await api.post('/package/getByDormAndStatusAndUserID', {
        dormID: id,
        status: selectedStatus,
        userID: userID, 
      });
      setPackages(res.data);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [id, selectedStatus]);

  return (
    <div>
      <div className="flex-between-menu">
        <h2>รายการพัสดุของฉัน</h2>
      </div>
      <div className="line-wrap">
        <div
          className={`line-item ${selectedStatus === 'wait_for_deliver' ? 'selected' : ''}`}
          onClick={() => setSelectedStatus('wait_for_deliver')}
        >
          ยังไม่ได้รับ
        </div>
        <div
          className={`line-item ${selectedStatus === 'delivered' ? 'selected' : ''}`}
          onClick={() => setSelectedStatus('delivered')}
        >
          ได้รับแล้ว
        </div>
      </div>

      <div className="package-container">
        {packages.map(pkg => (
          <div className="package-card" key={pkg.id}>
            <div className="package-image">
              <img src={pkg.pathToPicture ? `${BASE_URL}${pkg.pathToPicture}` : `${BASE_URL}/packages/default.png`} alt="package" />
            </div>
            <div className="package-info">
              <p><strong>หอพัก {pkg.dormID} ห้องพัก {pkg.recipientRoomNo}</strong></p>
              <p>เจ้าของพัสดุ: {pkg.recipientName}</p>
              <p>เข้าสู่ระบบเมื่อ: {new Date(pkg.registerTime).toLocaleString()}</p>
              <p>ผู้นำเข้าสู่ระบบ: {pkg.registerBy}</p>
            </div>
            <div className="package-action">
              {/* <button className="qr-button">
                <FontAwesomeIcon icon={faQrcode} />
              </button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantPackage;
