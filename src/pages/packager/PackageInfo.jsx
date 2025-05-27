import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../../utils/api';
import defaultPic from '../../assets/noimage.png'

const PackageInfo = ({ id, onClose }) => {
  const [pkg, setPkg] = useState(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await api.post('/package/getById', { id });
        setPkg(res.data);
      } catch (err) {
        console.error('Failed to fetch package:', err);
      }
    };
    fetchPackage();
  }, [id]);

  if (!pkg) return null;

  function formatThaiDateTime(isoString) {
    const isDev = import.meta.env.MODE === 'development';
    const date = new Date(isoString);
    const thaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));

    if (!isDev) {
      thaiDate.setHours(date.getHours() - 7);
    }

    const day = thaiDate.getDate();
    const month = thaiDate.getMonth();
    const year = thaiDate.getFullYear() + 543;
    const hours = thaiDate.getHours().toString().padStart(2, '0');
    const minutes = thaiDate.getMinutes().toString().padStart(2, '0');

    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    return `${day} ${thaiMonths[month]} ${year} ${hours}:${minutes} น.`;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>ปิด</button>

        <div className="package-image">
          <img
            src={pkg.pathToPicture ? `${BASE_URL}${pkg.pathToPicture}` : defaultPic}
            alt="package"
          />
        </div>

        <h3 style={{ color: 'green' }}>📦 สถานะ: {pkg.status}</h3>

        <p><strong>ผู้รับ:</strong> {pkg.recipientName}</p>
        <p><strong>ห้อง:</strong> {pkg.recipientRoomNo}</p>
        <p><strong>หอพัก:</strong> {pkg.dormName}</p>
        <p><strong>Tracking No.:</strong> {pkg.trackingNo}</p>

        <p><strong>เพิ่มโดย:</strong> {pkg.registerBy}</p>
        <p><strong>เวลาเพิ่ม:</strong> {formatThaiDateTime(pkg.registerTime)}</p>

        {pkg.status === 'delivered' && (
          <>
            <p><strong>นำจ่ายโดย:</strong> {pkg.deliverBy}</p>
            <p><strong>เวลา:</strong> {formatThaiDateTime(pkg.deliverTime)}</p>
            <p><strong>ผู้รับพัสดุ:</strong> {pkg.receiver}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PackageInfo;
