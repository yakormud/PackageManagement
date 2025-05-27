import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import PackageScanner from './PackageScanner';
import Swal from 'sweetalert2';
import api, { BASE_URL } from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';
import defaultPic from '../../assets/noimage.png'

const DeliverPackage = () => {
  const [userCode, setUserCode] = useState('');
  const [userData, setUserData] = useState(null);
  const { id: dormID } = useParams();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState([]);

  useEffect(() => {
    if (userCode) {
      if (userCode == '-99') {
        setUserData({
          fullName: 'ผู้ใช้ที่ไม่อยู่ในระบบ',
          id: -99, // userID
          roomID: '',
          roomNo: '-',
          email: ''
        })
      } else {
        checkUser();
      }
    }
  }, [userCode]);

  useEffect(() => {
    console.log(selectedPackage)
  }, [selectedPackage])

  useEffect(() => {
    console.log(userData?.id)
    if (userData && userData?.id) {
      fetchPackages(userData.id);
    }
  }, [userData?.id]);

  const checkUser = async () => {
    try {
      const res = await api.post('/dorm-user/checkIfUserInDorm', {
        code: userCode,
        dormID
      });

      setUserData(res.data);
      console.log(res.data)

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'ไม่พบผู้ใช้งานนี้ในระบบ',
        text: 'กรุณาตรวจสอบรหัสอีกครั้ง',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        setUserCode('');
      });
    }
  };

  const fetchPackages = async (recipientID) => {
    try {
      const res = await api.post('/package/fetchToDeliver', {
        recipientID,
        dormID
      });
      setPackages(res.data);
      console.log(res.data)
    } catch (err) {
      console.error('Error fetching packages', err);
    }
  };

  function formatThaiDateTime(isoString) {
    const isDev = import.meta.env.MODE === 'development';
    const date = new Date(isoString);
    const thaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));

    if (!isDev) {
      date.setHours(date.getHours() - 7);
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

  const toggleSelectPackage = (id) => {
    setSelectedPackage(prev =>
      prev.includes(id)
        ? prev.filter(pkgID => pkgID !== id)
        : [...prev, id]
    );
  };

  const handleDeliver = async () => {

    let receiverName = userData.fullName;

    if (userData.id === -99) {
    const { value: inputName, isConfirmed } = await Swal.fire({
      title: 'กรอกชื่อผู้รับ',
      input: 'text',
      inputLabel: 'ชื่อ-นามสกุล',
      inputPlaceholder: 'กรอกชื่อผู้รับพัสดุ',
      showCancelButton: true,
      confirmButtonText: 'ถัดไป',
      cancelButtonText: 'ยกเลิก',
      inputValidator: (value) => {
        if (!value) return 'กรุณากรอกชื่อ';
      },
    });

    if (!isConfirmed) return;
    receiverName = inputName;
  } 

    const confirm = await Swal.fire({
      title: `ยืนยันการนำจ่าย`,
      text: `คุณต้องการนำจ่ายพัสดุ ${selectedPackage.length} ชิ้นให้กับ ${receiverName} หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    });

    if (confirm.isConfirmed) {
      try {
        await api.post('/package/deliverPackage', {
          selectedPackage: selectedPackage,
          receiver: userData.fullName,
          dormID: dormID,
          email: userData.email,
        });

        await Swal.fire({
          icon: 'success',
          title: 'นำจ่ายพัสดุสำเร็จ',
          text: `พัสดุ ${selectedPackage.length} ชิ้นถูกนำจ่ายเรียบร้อยแล้ว`,
          confirmButtonText: 'ตกลง'
        });

        // navigate(`/dorm/${dormID}/deliver`);
        setUserCode('');
        setUserData(null);
        setPackages([]);
        setSelectedPackage([]);
        // window.location.reload();
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถนำจ่ายพัสดุได้',
          confirmButtonText: 'ตกลง'
        });
      }
    }
  };


  return (
    <div>
      {!userCode ? (
        <PackageScanner
          onDetected={(code) => setUserCode(code)}
          onClose={() => navigate(-1)}
          isDeliverMode = {true}
        />
      ) : userData ? (
        <div>

          <div className='deliver-header'>
            <p>ผู้รับพัสดุ</p>
            <h3>{userData.fullName} <strong>(ห้อง {userData.roomNo})</strong></h3>
            <h2>จำนวน {packages.length} ชิ้น</h2>
            <p className='edit-track' onClick={() => setUserCode('')} style={{ marginLeft: 10, cursor: 'pointer', color: 'blue' }}>
              แสกนใหม่
            </p>
          </div>

          <div className="package-container">
            {packages.length > 0 && (<p>เลือกพัสดุด้านล่างเพื่อทำการนำจ่าย</p>)}
            {packages.length > 0 ? (
              packages.map(pkg => (
                <div className={`package-card ${selectedPackage.includes(pkg.id) ? 'selected' : ''}`}
                  key={pkg.id}
                  onClick={() => toggleSelectPackage(pkg.id)}
                  style={{ cursor: 'pointer' }}>

                  <div className="package-image">
                    <img
                      src={pkg.pathToPicture ? `${BASE_URL}${pkg.pathToPicture}` : defaultPic}
                      alt="package"
                    />
                  </div>
                  <div className="package-info">
                    <h2>{pkg.recipientRoomNo} | {pkg.recipientName}</h2>
                    <h3 style={{ color: "#191970" }}>
                      <FontAwesomeIcon icon={faBarcode} /> {pkg.trackingNo}
                    </h3>
                    <p>🗓️ เข้าสู่ระบบเมื่อ: {formatThaiDateTime(pkg.registerTime)}</p>
                    <p>👤 เพิ่มโดย: {pkg.registerBy}</p>
                  </div>


                </div>

              ))


            ) : (
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>ไม่มีพัสดุให้รับ</p>
            )}
          </div>

          {selectedPackage.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button onClick={handleDeliver} className='mybtn btn-full-width' style={{ marginBottom: "50px" }}>
                นำจ่ายพัสดุ ({selectedPackage.length} ชิ้น)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        </div>
      )}
    </div>
  );
};

export default DeliverPackage;
