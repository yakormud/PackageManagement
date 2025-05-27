import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { BASE_URL } from '../../utils/api';
import PackageEditModal from './PackageEditModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';
import PackageInfo from './PackageInfo';
import defaultPic from '../../assets/noimage.png'

const DormPackage = () => {
  const { id } = useParams(); // dormID from URL
  const [selectedStatus, setSelectedStatus] = useState('wait_for_deliver');
  const [packages, setPackages] = useState([]);

  const [selectedPackage, setSelectedPackage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 25;

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectInfoPackage, setSelectInfoPackage] = useState(null);

  const navigate = useNavigate();

  const fetchPackages = async (isLoadMore = false) => {
    try {
      const [packageRes, countRes] = await Promise.all([
        api.post('/package/getByDormAndStatus', {
          dormID: id,
          status: selectedStatus,
          search,
          limit,
          offset: isLoadMore ? offset : 0,
          date: selectedDate || null
        }),
        api.post('/package/getByDormAndStatus/count', {
          dormID: id,
          status: selectedStatus,
          search,
          date: selectedDate || null
        })
      ]);

      if (isLoadMore) {
        setPackages(prev => [...prev, ...packageRes.data]);
      } else {
        setPackages(packageRes.data);
      }

      setTotalCount(countRes.data.total);

      if (packageRes.data.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (!isLoadMore) {
        setOffset(limit);
      } else {
        setOffset(prev => prev + limit);
      }

    } catch (err) {
      console.error('Failed to fetch packages:', err);
    }
  };



  useEffect(() => {
    setOffset(0);
    fetchPackages(false);
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



  return (
    <div>
      <div className="flex-between-menu">
        <h2>รายการพัสดุทั้งหมด</h2>
        {/* <a onClick={() => navigate(`/dorm/${id}/deliver`)}>นำจ่ายพัสดุ</a> */}
      </div>

      <div className='search-package-container'>

        <div className='search-group'>
          <label style={{ marginBottom: '4px' }}>
            ค้นหา
          </label>
          <input
            type="text"
            className="myinput"
            placeholder="🔍 ค้นด้วยเลขพัสดุ / เลขห้อง / ชื่อผู้รับ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }} className='input-group'>
          <label style={{ marginBottom: '4px' }}>
            {selectedStatus === 'delivered' ? 'วันที่รับพัสดุ' : 'วันที่เข้าสู่ระบบ'}
          </label>
          <input
            type="date"
            className="myinput input-180"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>


      <div className="line-wrap" style={{ marginTop: "15px" }}>
        <div
          className={`line-item ${selectedStatus === 'wait_for_deliver' ? 'selected' : ''}`}
          onClick={() => {
            setSelectedStatus('wait_for_deliver')
            setSelectedDate('')
          }}
        >
          รอการนำจ่าย
        </div>
        <div
          className={`line-item ${selectedStatus === 'delivered' ? 'selected' : ''}`}
          onClick={() => {
            setSelectedStatus('delivered')
            setSelectedDate('')
          }}
        >
          นำจ่ายแล้ว
        </div>
      </div>

      <p style={{ marginTop: "20px" }}>
        แสดงรายการพัสดุ {packages.length} รายการ จากทั้งหมด {totalCount} รายการ
      </p>

      <div className="package-container">
        {packages.map(pkg => (
          <div className="package-card" key={pkg.id} onClick={() => {
            setShowInfoModal(true);
            setSelectInfoPackage(pkg.id);
          }}>
            <div className="package-image">
              <img src={pkg.pathToPicture ? `${BASE_URL}${pkg.pathToPicture}` : defaultPic} alt="package" />
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
            {pkg.status == 'wait_for_deliver' &&
              <div className="package-action">
                <button className="go-button" onClick={(e) => {
                  e.stopPropagation();
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

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '0', marginBottom: '50px' }}>
          <button className="mybtn btn-full-width btn-white" onClick={() => fetchPackages(true)}>
            ดูเพิ่มเติม
          </button>
        </div>
      )}
      {showModal &&
        <PackageEditModal id={selectedPackage} onClose={(isUpdate) => {
          setShowModal(false)
          setSelectedPackage('');
          fetchPackages(false);
        }} />
      }

      {showInfoModal &&
        <PackageInfo
          id={selectInfoPackage}
          onClose={() => {
            setShowInfoModal(false);
            setSelectInfoPackage(null);
          }}
        />
      }
    </div>
  );
};

export default DormPackage;
