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

  return (
    <div>
      <h2>คำขอเข้าร่วมหอพัก</h2>
      <div className="package-container">
        {requests.map((req) => (
          <div className="package-card" key={req.id}>
            <div className="package-image">
            </div>
            <div className="package-info">
              <p><strong>หอพัก {req.dormID} ห้องพัก {req.roomID || '-'}</strong></p>
              <p>ชื่อผู้ขอ: {req.fullName}</p>
              <p>วันที่: {new Date(req.date).toLocaleString()}</p>
              <p>สถานะ: {req.status}</p>
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
