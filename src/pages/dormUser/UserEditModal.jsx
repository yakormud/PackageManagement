import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useParams } from 'react-router-dom';

const UserEditModal = ({ id, onClose }) => {
  const { id: dormID } = useParams();
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  useEffect(() => {
    if (role === 'tenant') {
      fetchRooms();
    }
  }, [role]);

  const fetchUser = async () => {
    try {
      const res = await api.post('/dorm-user/getById', { id });
      setFullName(res.data.fullName);
      setRole(res.data.role);
      setSelectedRoom(res.data.roomID || '');
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get(`/dorm-room/getAllRoom/${dormID}`);
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/dorm-user/updateUser', {
        id,
        fullName,
        role,
        roomID: role === 'tenant' ? selectedRoom : 0,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>แก้ไขผู้ใช้</h3>
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
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>{room.roomNo}</option>
            ))}
          </select>
        )}

        <div className="modal-actions">
          <button onClick={handleSubmit}>ยืนยัน</button>
          <button onClick={onClose}>ยกเลิก</button>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
