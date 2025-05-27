import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api , { BASE_URL} from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';
import PackageInfo from './PackageInfo';

const TenantPackage = () => {
  const { id } = useParams(); 
  const [selectedStatus, setSelectedStatus] = useState('wait_for_deliver');
  const [packages, setPackages] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState('');

  const [selectInfo, setSelectInfo] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  const fetchPackages = async () => {
    try {
      const res = await api.post('/package/getTenantPackage', {
        dormID: id,
        status: selectedStatus,
        search: search,
        date: selectedDate,
      });
      setPackages(res.data);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [id, selectedStatus, search, selectedDate]);

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

  const closeInfo = () => {
    setShowInfo(false)
    setSelectInfo(null)
  }

  return (
    <div>
      <div className="flex-between-menu">
        <h2>รายการพัสดุของฉัน</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', flex: '1' }}>
          <label style={{ marginBottom: '4px' }}>
            ค้นหา
          </label>
          <input
            type="text"
            className="myinput"
            placeholder="🔍 ค้นด้วยเลขพัสดุ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '4px' }}>
            {selectedStatus === 'delivered' ? 'วันที่รับพัสดุ' : 'วันที่เข้าสู่ระบบ'}
          </label>
          <input
            type="date"
            className="myinput"
            style={{ maxWidth: "180px" }}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>


      <div className="line-wrap" style={{marginTop:"10px"}}>
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
        {packages.length == 0 && <p style={{textAlign:"center"}}>ไม่พบรายการพัสดุ</p>}
        {packages.map(pkg => (
          <div className="package-card" key={pkg.id} onClick={()=> {
            setSelectInfo(pkg.id)
            setShowInfo(true)
          }}>
            <div className="package-image">
              <img src={pkg.pathToPicture ? `${BASE_URL}${pkg.pathToPicture}` : `${BASE_URL}/packages/default.png`} alt="package" />
            </div>
            <div className="package-info">
              <h2>{pkg.recipientRoomNo} | {pkg.recipientName}</h2>
              <h3 style={{ color: "#191970" }}><FontAwesomeIcon icon={faBarcode} /> {pkg.trackingNo}</h3>
              <p>
                🗓️ {pkg.status === 'delivered' ? 'นำจ่ายเมื่อ' : 'เข้าสู่ระบบเมื่อ'}: {formatThaiDateTime(pkg.status === 'delivered' ? pkg.deliverTime : pkg.registerTime)}
              </p>
              <p>
                👤 {pkg.status === 'delivered' ? 'ผู้รับ' : 'เพิ่มโดย'}: {pkg.status === 'delivered' ? pkg.receiver : pkg.registerBy}
              </p>
            </div>
          </div>
        ))}

        {showInfo && <PackageInfo id={selectInfo} onClose={closeInfo}/>}

      </div>
    </div>
  );
};

export default TenantPackage;
