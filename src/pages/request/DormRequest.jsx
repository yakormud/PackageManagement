import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import RequestModal from './RequestModal';

const DormRequest = () => {
  const { id } = useParams();
  const [requests, setRequests] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalID, setModalID] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [id]);
  const fetchRequests = async () => {
    try {
      const res = await api.get(`/request/getAllRequestInDorm/${id}`);
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };


  const handleModalShow = (id) => {
    setModalID(id);
    setShowModal(true);
  }

  const closeModal = () => {
    setModalID('');
    setShowModal(false);
    fetchRequests();
  }

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
      <h2>คำขอเข้าร่วมหอพัก</h2>
      <div className="package-container">
        {requests.length == 0 && <p style={{textAlign:"center"}}>ไม่พบเข้าร่วมหอพัก</p>}
        {requests.map((req) => (
          <div className="package-card" key={req.id}>
            <div className="package-image">
            </div>
            <div className="package-info">
              <p>ชื่อผู้ขอ: {req.fullName}</p>
              <p>วันที่: {formatThaiDateTime(req.date)}</p>
            </div>
            <div className="package-action">
              <button className="go-button" onClick={() => handleModalShow(req.id)}>
                จัดการคำขอ
              </button>
            </div>
          </div>
        ))}
      </div>
      {showModal && <RequestModal id={modalID} handleCloseModal={closeModal}/>}
    </div>
  );
};

export default DormRequest;
