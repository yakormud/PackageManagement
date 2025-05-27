import React, { useState } from 'react';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const RoomAddModal = ({ dormID, onClose, onRefresh }) => {
  const [roomNo, setRoomNo] = useState('');

  const handleSubmit = async () => {
    if (roomNo === '') {
      await Swal.fire({
        icon: 'info',
        title: 'ผิดพลาด',
        text: 'กรุณากรอกหมายเลขห้อง',
      });
      return;
    }
    try {
      await api.post('/dorm-room/create', { dormID, roomNo });
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่มห้องเรียบร้อย',
      });
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Failed to add room:', err);
      await Swal.fire({
        icon: 'error',
        title: 'ล้มเหลว',
        text: err?.response?.data?.message || 'เกิดข้อผิดพลาด',
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>เพิ่มห้องพัก</h3>

        <label>หมายเลขห้อง</label>
        <input
          type="text"
          value={roomNo}
          onChange={(e) => setRoomNo(e.target.value)}
          placeholder="หมายเลขห้อง"
        />

        <div className="modal-actions">
          <button onClick={onClose} className="mybtn btn-white">ยกเลิก</button>
          <button onClick={handleSubmit} className="mybtn">เพิ่ม</button>
        </div>
      </div>
    </div>
  );

};

export default RoomAddModal;
