import React, { useState } from 'react';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const RoomEditModal = ({ roomData, onClose, onRefresh }) => {
  const [roomNo, setRoomNo] = useState(roomData.roomNo);

  const handleUpdate = async () => {
    if (roomNo === '') {
      await Swal.fire({
        icon: 'info',
        title: 'ผิดพลาด',
        text: 'กรุณากรอกหมายเลขห้อง',
      });
      return;
    }
    try {
      await api.put(`/dorm-room/update/${roomData.id}`, { roomNo });
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'อัพเดทข้อมูลเรียบร้อย',
      });
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Failed to update room:', err);
      await Swal.fire({
        icon: 'error',
        title: 'ล้มเหลว',
        text: err?.response?.data?.message || 'เกิดข้อผิดพลาด',
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณแน่ใจหรือไม่ที่จะลบห้องนี้?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/dorm-room/delete/${roomData.id}`);
        await Swal.fire('สำเร็จ', 'ห้องถูกลบเรียบร้อย', 'success');
        onRefresh();
        onClose();
      } catch (err) {
        console.error('Failed to delete room:', err);
        await Swal.fire({
          icon: 'error',
          title: 'ล้มเหลว',
          text: err?.response?.data?.message || 'เกิดข้อผิดพลาด',
        });
        onRefresh();
        onClose();
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>แก้ไขห้องพัก</h3>

        <label>เลขห้อง</label>
        <input
          type="text"
          value={roomNo}
          onChange={(e) => setRoomNo(e.target.value)}
          placeholder="เลขห้อง"
        />

        <div className="modal-actions room-edit-button">
          <button onClick={onClose} className="mybtn btn-white">ยกเลิก</button>
          <button
            onClick={handleDelete}
            className="mybtn btn-black"
          >
            ลบห้อง
          </button>
          <button onClick={handleUpdate} className="mybtn">บันทึก</button>
        </div>
      </div>
    </div>
  );

};

export default RoomEditModal;
