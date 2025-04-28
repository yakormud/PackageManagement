import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { BASE_URL } from '../../utils/api';
import PackageEditModal from './PackageEditModal';

const DormPackage = () => {
  const { id } = useParams(); // dormID from URL
  const [selectedStatus, setSelectedStatus] = useState('wait_for_deliver');
  const [packages, setPackages] = useState([]);

  const [selectedPackage, setSelectedPackage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const fetchPackages = async () => {
    try {
      const res = await api.post('/package/getByDormAndStatus', {
        dormID: id,
        status: selectedStatus
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
        <h2>รายการพัสดุทั้งหมด</h2>
        <a onClick={() => navigate(`/dorm/${id}/deliver`)}>นำจ่ายพัสดุ</a>
      </div>
      <div className="line-wrap">
        <div
          className={`line-item ${selectedStatus === 'wait_for_deliver' ? 'selected' : ''}`}
          onClick={() => setSelectedStatus('wait_for_deliver')}
        >
          รอการนำจ่าย
        </div>
        <div
          className={`line-item ${selectedStatus === 'delivered' ? 'selected' : ''}`}
          onClick={() => setSelectedStatus('delivered')}
        >
          นำจ่ายแล้ว
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
            {pkg.status == 'wait_for_deliver' &&
              <div className="package-action">
                <button className="go-button" onClick={() => {
                  setShowModal(true)
                  setSelectedPackage(pkg.id)
                }
                }>
                  แก้ไขข้อมูล
                </button>
              </div>}
          </div>
        ))}
      </div>
      {showModal &&
        <PackageEditModal id={selectedPackage} onClose={() => {
          setShowModal(false)
          setSelectedPackage('');
          fetchPackages();
        }} />
      }
    </div>
  );
};

export default DormPackage;
