import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

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
    if (fullName === '' || role === '') {
      await Swal.fire({
        icon: 'info',
        title: 'ผิดพลาด',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      });
      return;
    } else {
      if (role === 'tenant' && selectedRoom === '') {
        await Swal.fire({
          icon: 'info',
          title: 'ผิดพลาด',
          text: 'กรุณากรอกหมายเลขห้อง',
        });
        return;
      }
    }
    try {
      await api.post('/dorm-user/updateUser', {
        id,
        fullName,
        role,
        roomID: role === 'tenant' ? selectedRoom : 0,
      });
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'อัพเดทข้อมูลเรียบร้อย',
      });
      onClose();
    } catch (err) {
      console.error('Failed to update user:', err);
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
      text: 'คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await api.post('/dorm-user/deleteUser', {
          id: id
        });
        await Swal.fire('สำเร็จ', 'ผู้ใช้งานถูกลบเรียบร้อย', 'success');
        onClose();
      } catch (err) {
        console.error('Failed to delete room:', err);
        await Swal.fire({
          icon: 'error',
          title: 'ล้มเหลว',
          text: err?.response?.data?.message || 'เกิดข้อผิดพลาด',
        });
      }
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>แก้ไขผู้ใช้</h3>

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
          setSelectedRoom("")
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
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.roomNo}</option>
              ))}
            </select>
          </>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className='mybtn btn-white'>ยกเลิก</button>
          <button onClick={handleDelete} className='mybtn btn-black'>ลบผู้ใช้</button>
          <button onClick={handleSubmit} className='mybtn'>ยืนยัน</button>
        </div>
      </div>
    </div>
  );

};

export default UserEditModal;
