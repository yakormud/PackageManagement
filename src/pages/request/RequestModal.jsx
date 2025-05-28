import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const RequestModal = ({ id, handleCloseModal }) => {

  const [fullName, setFullName] = useState('');
  const [dormID, setDormID] = useState(''); 
  const [role, setRole] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [userID, setUserID] = useState('');

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
      setUserID(res.data.userID);
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
    if (role === '' || fullName === '') {
      await Swal.fire({
        icon: 'info',
        title: 'ผิดพลาด',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      });
      return;
    }else {
      if (role === 'tenant' && selectedRoom === '') {
        await Swal.fire({
        icon: 'info',
        title: 'ผิดพลาด',
        text: 'กรุณากรอกหมายเลขห้อง',
      });
        return;
      }
    }
    console.log("UID: ", userID)
    try {
      await api.post('/dorm-user/addUser', {
        fullName,
        role,
        roomID: role === 'tenant' ? selectedRoom : 0,
        userID: userID,
        dormID: dormID,
        requestID: id
      });

      await api.delete(`/request/deleteRequest/${id}`);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่มผู้ใช้เข้าสู่หอพักเรียบร้อย',
      });
      handleCloseModal();
    } catch (err) {
      console.error('Submit error', err);
      await Swal.fire({
        icon: 'error',
        title: 'ล้มเหลว',
        text: err?.response?.data?.message || 'เกิดข้อผิดพลาด',
      });
    }
  };

  const deleteRequest = async () => {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ',
    text: 'คุณแน่ใจหรือไม่ว่าต้องการลบคำขอนี้?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ลบเลย',
    cancelButtonText: 'ยกเลิก',
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/request/deleteRequest/${id}`);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'ลบคำขอเรียบร้อย',
      });
      handleCloseModal();
    } catch (err) {
      console.error('Submit error', err);
      await Swal.fire({
        icon: 'error',
        title: 'ล้มเหลว',
        text: err?.response?.data?.message || 'เกิดข้อผิดพลาด',
      });
    }
  }
};



  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>จัดการคำขอ</h3>

        <label>ชื่อ-นามสกุล</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="ชื่อ-นามสกุล"
        />

        <label>บทบาท</label>
        <select value={role} onChange={(e) => {
          setRole(e.target.value)
          setSelectedRoom('');
        }}>
          <option value="">เลือกบทบาท</option>
          <option value="tenant">ผู้เช่า</option>
          <option value="package_manager">เจ้าหน้าที่พัสดุ</option>
          <option value="admin">แอดมิน</option>
        </select>

        {role === 'tenant' && (
          <>
            <label>ห้องพัก</label>
            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
              <option value="">เลือกห้องพัก</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.roomNo}</option>
              ))}
            </select>
          </>
        )}

        <div className="modal-actions">
          <button onClick={handleCloseModal} className="mybtn btn-white">ยกเลิก</button>
          <button onClick={deleteRequest} className="mybtn btn-black">ลบคำขอ</button>
          <button onClick={handleSubmit} className="mybtn">ยืนยัน</button>
        </div>
      </div>
    </div>
  );

};

export default RequestModal;