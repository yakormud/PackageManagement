import React, { useState, useEffect } from 'react';
import PackageScanner from './PackageScanner';
import { useNavigate } from 'react-router-dom';
import api, { BASE_URL } from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';
import defaultPic from '../../assets/noimage.png'

const AddPackage = () => {
  const [trackingNo, setTrackingNo] = useState('');
  const [packageData, setPackageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPackage = async () => {
      if (!trackingNo) return;

      try {
        setLoading(true);
        const res = await api.post('/package/checkIfExist', { trackingNo });

        if (res.data.length === 0) {
          navigate(`./form?trackingNo=${trackingNo}`);
          return;
        }
        setPackageData(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkPackage();
  }, [trackingNo]);

  return (
    <div style={{ padding: 20 }} className='add-package-form'>
      {!trackingNo ? (
        <PackageScanner
          onDetected={(code) => setTrackingNo(code)}
          onClose={() => navigate(-1)}
          isBarcode={true}
        />
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: "0" }}>เพิ่มพัสดุ</h2>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <p style={{ fontSize: "1.1rem" }}>หมายเลขพัสดุ {trackingNo}</p>
            <p className='edit-track' onClick={() => setTrackingNo('')}>แก้ไข</p>
          </div>

          {loading ? (
            <p style={{ marginTop: "25px" }}>กำลังตรวจสอบ...</p>
          ) : packageData.length > 0 ? (
            <>
              <p style={{ marginTop: "25px", marginBottom: "0" }}>พบ {packageData.length} รายการพัสดุที่ตรงกับเลขพัสดุนี้</p>
              <div className="package-container">
                {packageData.map(pkg => (
                  <div className="package-card" key={pkg.id} style={{ marginTop: 20 }}>
                    <div className="package-image">
                      <img
                        src={pkg.pathToPicture ? `${BASE_URL}${pkg.pathToPicture}` : defaultPic}
                        alt="package"
                        style={{ width: '100%', maxWidth: 300 }}
                      />
                    </div>
                    <div className="package-info" style={{ marginTop: 10, textAlign: "start" }}>
                      <h3>{pkg.recipientRoomNo} | {pkg.recipientName}</h3>
                      <p><FontAwesomeIcon icon={faBarcode} /> {pkg.trackingNo}</p>
                      <p>🗓️ เข้าสู่ระบบเมื่อ: {new Date(pkg.registerTime).toLocaleString()}</p>
                      <p>👤 เพิ่มโดย: {pkg.registerBy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className='same-package-button'>
                <button className='mybtn btn-peel btn-white' onClick={() => navigate(`./form?trackingNo=${trackingNo}`)}>เพิ่มพัสดุหมายเลข {trackingNo}</button>
                <button className='mybtn btn-peel btn-black' onClick={() => setTrackingNo('')}>แสกนใหม่</button>
              </div>
            </>
          ) : (
            <div className=""></div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddPackage;
