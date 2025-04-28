import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const RequestModal = ({ id, handleCloseModal }) => {
  const [fullName, setFullName] = useState('');
  const [dormID, setDormID] = useState('');
  const [role, setRole] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');

  useEffect(() => {
    if (role === 'tenant') {
      fetchRooms();
    }
  }, [role]);

  useEffect(() => {
    fetchFullName();
  }, [id]);

  const fetchFullName = async () => {
    try {
      const res = await api.get(`/request/${id}`);
      setFullName(res.data.fullName);
      setDormID(res.data.dormID);
    } catch (err) {
      console.error('Failed to fetch full name from request:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get(`/dorm-room/getAllRoom/${dormID}`);
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/dorm-user/addUser', {
        fullName,
        role,
        roomID: role === 'tenant' ? selectedRoom : 0,
        userID: 1, 
        dormID: dormID,
        requestID: id
      });

      await api.delete(`/request/deleteRequest/${id}`);
      handleCloseModal();
    } catch (err) {
      console.error('Submit error', err);
    }
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>จัดการคำขอ</h3>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="ชื่อ-นามสกุล"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">เลือกบทบาท</option>
          <option value="tenant">ผู้เช่า</option>
          <option value="package_manager">เจ้าหน้าที่พัสดุ</option>
          <option value="admin">แอดมิน</option>
        </select>

        {role === 'tenant' && (
          <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
            <option value="">เลือกห้องพัก</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.roomNo}</option>
            ))}
          </select>
        )}

        <div className="modal-actions">
          <button onClick={handleSubmit}>ยืนยัน</button>
          <button onClick={handleCloseModal}>ยกเลิก</button>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;