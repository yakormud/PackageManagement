import React, { useState } from 'react';
import api from '../../utils/api';

const RoomEditModal = ({ roomData, onClose, onRefresh }) => {
  const [roomNo, setRoomNo] = useState(roomData.roomNo);

  const handleUpdate = async () => {
    try {
      await api.put(`/dorm-room/update/${roomData.id}`, { roomNo });
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Failed to update room:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/dorm-room/delete/${roomData.id}`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>แก้ไขห้องพัก</h3>

        <input
          type="text"
          value={roomNo}
          onChange={(e) => setRoomNo(e.target.value)}
          placeholder="เลขห้อง"
        />

        <div className="modal-actions">
          <button onClick={onClose}>ยกเลิก</button>
          <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>
            ลบห้อง
          </button>
          <button onClick={handleUpdate}>บันทึก</button>
        </div>
      </div>
    </div>
  );
};

export default RoomEditModal;
