import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../../utils/api';

const DormEditModal = ({ dormData, setIsEditMode, refreshDorm }) => {
  const [formData, setFormData] = useState({
    name: dormData.name,
    address: dormData.address,
    ownerName: dormData.ownerName,
    phoneNo: dormData.phoneNo,
    oldPath: dormData.pathToPicture || '',
    deleteImage: false,
    picture: null
  });

  useEffect(()=> {
    console.log(formData)
  },[formData])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      picture: e.target.files[0],
      deleteImage: false
    }));
  };

  const handleDeleteImage = () => {
    setFormData(prev => ({
      ...prev,
      picture: null,
      deleteImage: true
    }));
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('address', formData.address);
    data.append('ownerName', formData.ownerName);
    data.append('phoneNo', formData.phoneNo);
    data.append('oldPath', formData.oldPath);
    data.append('deleteImage', formData.deleteImage);

    if (formData.picture) {
      data.append('picture', formData.picture);
    }

    try {
      await api.put(`/dorm/update/${dormData.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
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

        <label>ชื่อหอพัก</label>
        <input name="name" value={formData.name} onChange={handleChange} />

        <label>ที่อยู่</label>
        <input name="address" value={formData.address} onChange={handleChange} />

        <label>เจ้าของหอพัก</label>
        <input name="ownerName" value={formData.ownerName} onChange={handleChange} />

        <label>เบอร์ติดต่อ</label>
        <input name="phoneNo" value={formData.phoneNo} onChange={handleChange} />

        <label>รูปหอพัก</label>
        {formData.oldPath && !formData.deleteImage && !formData.picture && (
          <div className='edit-image'>
            <img src={`${BASE_URL}${formData.oldPath}`} alt="dorm" width="200" />
            <button className="delete-pic" type="button" onClick={handleDeleteImage}>ลบรูป</button>
          </div>
        )}
        {formData.picture && (
          <img
            src={URL.createObjectURL(formData.picture)}
            alt="preview"
            style={{ width: '200px', marginTop: '10px' }}
          />
        )}
        <input type="file" onChange={handleFileChange} />

        <div className="modal-actions">
          <button className="mybtn btn-white" onClick={() => setIsEditMode(false)}>ยกเลิก</button>
          <button className="mybtn" onClick={handleSubmit}>ยืนยัน</button>
        </div>
      </div>
    </div>
  );
};

export default DormEditModal;
