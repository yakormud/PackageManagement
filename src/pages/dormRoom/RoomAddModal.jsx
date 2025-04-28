import React, { useState } from 'react';
import api from '../../utils/api';

const RoomAddModal = ({ dormID, onClose, onRefresh }) => {
  const [roomNo, setRoomNo] = useState('');

  const handleSubmit = async () => {
    try {
      await api.post('/dorm-room/create', { dormID, roomNo });
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Failed to add room:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>เพิ่มห้องพัก</h3>

        <input
          type="text"
          value={roomNo}
          onChange={(e) => setRoomNo(e.target.value)}
          placeholder="หมายเลขห้อง"
        />

        <div className="modal-actions">
          <button onClick={handleSubmit}>เพิ่ม</button>
          <button onClick={onClose}>ยกเลิก</button>
        </div>
      </div>
    </div>
  );
};

export default RoomAddModal;
