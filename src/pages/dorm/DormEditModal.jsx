import React, { useState } from 'react';
import api from '../../utils/api';

const DormEditModal = ({ dormData, setIsEditMode, refreshDorm }) => {
  const [name, setName] = useState(dormData.name);
  const [address, setAddress] = useState(dormData.address);
  const [ownerName, setOwnerName] = useState(dormData.ownerName);
  const [phoneNo, setPhoneNo] = useState(dormData.phoneNo);

  const handleSubmit = async () => {
    try {
      await api.put(`/dorm/update/${dormData.id}`, {
        name,
        address,
        ownerName,
        phoneNo
      });
      await refreshDorm(); 
      setIsEditMode(false);
    } catch (err) {
      console.error('Failed to update dorm:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>แก้ไขรายละเอียดหอพัก</h3>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อหอพัก"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ที่อยู่"
        />
        <input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="เจ้าของหอพัก"
        />
        <input
          type="text"
          value={phoneNo}
          onChange={(e) => setPhoneNo(e.target.value)}
          placeholder="เบอร์ติดต่อ"
        />

        <div className="modal-actions">
          <button onClick={handleSubmit}>ยืนยัน</button>
          <button onClick={() => setIsEditMode(false)}>ยกเลิก</button>
        </div>
      </div>
    </div>
  );
};

export default DormEditModal;
