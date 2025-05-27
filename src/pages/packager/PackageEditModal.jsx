import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import api, { BASE_URL } from '../../utils/api';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const PackageEditModal = ({ id, onClose }) => {
  const { id: dormID } = useParams();

  const [formData, setFormData] = useState({
    recipientID: '',
    recipientName: '',
    recipientRoomNo: '',
    trackingNo: '',
    pathToPicture: '',
  });

  const [newImage, setNewImage] = useState(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [people, setPeople] = useState([]);

  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPackage();
      fetchRooms();
      fetchPeople();
    }
  }, [id]);

  const fetchPackage = async () => {
    try {
      const res = await api.post('/package/getById', { id });
      const data = res.data;
      setFormData({
        recipientID: data.recipientID,
        recipientName: data.recipientName,
        recipientRoomNo: data.recipientRoomNo,
        trackingNo: data.trackingNo,
        pathToPicture: data.pathToPicture,
      });
      setDeleteImage(false);
    } catch (err) {
      console.error('Failed to fetch package:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get(`/dropdown/rooms/${dormID}`);
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const fetchPeople = async () => {
    try {
      const res = await api.get(`/dropdown/users/${dormID}`);
      setPeople(res.data);
    } catch (err) {
      console.error('Failed to fetch people:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
    setDeleteImage(false); // ถ้าเลือกใหม่ ถือว่าไม่ลบ
  };

  const handleDeleteImage = () => {
    setNewImage(null);
    setDeleteImage(true);
  };

  const handleSubmit = async () => {
    setIsSubmit(true);
    const form = new FormData();
    form.append('id', id);
    form.append('recipientID', formData.recipientID);
    form.append('recipientName', formData.recipientName);
    form.append('recipientRoomNo', formData.recipientRoomNo);
    form.append('trackingNo', formData.trackingNo);
    form.append('oldPath', formData.pathToPicture);
    form.append('deleteImage', deleteImage);
    if (newImage) {
      form.append('image', newImage);
    }
    console.log(form)

    try {
      await api.post('/package/update', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'อัพเดทข้อมูลเรียบร้อย',
      });
      setIsSubmit(false);
      onClose();
    } catch (err) {
      console.error('Failed to update package:', err);
      await Swal.fire({
        icon: 'error',
        title: 'ล้มเหลว',
        text: err?.response?.data?.message || 'เกิดข้อผิดพลาด',
      });
      setIsSubmit(false);
    }
  };

  const handleDelete = async () => {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ',
    text: 'คุณแน่ใจหรือไม่ว่าต้องการลบพัสดุชิ้นนี้?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ลบเลย',
    cancelButtonText: 'ยกเลิก',
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/package/delete/${id}`);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'ลบพัสดุเรียบร้อย',
      });
      onClose();
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
        <h3>แก้ไขรายละเอียดพัสดุ</h3>

        <label htmlFor="recipientName">ชื่อผู้รับ</label>
        <CreatableSelect
          id="recipientName"
          isClearable
          isSearchable
          formatCreateLabel={(input) => `เพิ่มชื่อใหม่: "${input}"`}
          options={people.map(user => ({
            label: user.label,
            value: user.fullName,
            roomNo: user.roomNo || '',
            userDormID: user.userDormID
          }))}
          value={
            formData.recipientName
              ? { label: formData.recipientName, value: formData.recipientName }
              : null
          }
          onChange={(selected) => {
            if (!selected) {
              setFormData(prev => ({
                ...prev,
                recipientName: '',
                recipientID: -99,
                recipientRoomNo: '',
              }));
            } else if (selected.__isNew__) {
              setFormData(prev => ({
                ...prev,
                recipientName: selected.value,
                recipientID: -99,
                recipientRoomNo: 'ไม่ระบุ',
              }));
            } else {
              setFormData(prev => ({
                ...prev,
                recipientName: selected.value,
                recipientID: selected.userDormID,
                recipientRoomNo: selected.roomNo,
              }));
              console.log(selected.userDormID)
            }
          }}
          placeholder="ค้นหาหรือเพิ่มชื่อผู้รับ"
        />

        <label htmlFor="roomNo">หมายเลขห้อง</label>
        <select
          id='roomNo'
          name="recipientRoomNo"
          value={formData.recipientRoomNo}
          onChange={handleChange}
        >
          <option value="">เลือกห้อง</option>
          <option value="ไม่ระบุ">ไม่ระบุ</option>
          {rooms.map(r => (
            <option key={r.id} value={r.roomNo}>{r.roomNo}</option>
          ))}
        </select>

        <label htmlFor="trackNo">หมายเลขพัสดุ</label>
        <input
          id='trackNo'
          type="text"
          name="trackingNo"
          value={formData.trackingNo}
          onChange={handleChange}
          placeholder="Tracking No."
        />

        <label>รูปภาพ</label>
        {formData.pathToPicture && !deleteImage && !newImage && (
          <div className='edit-image'>
            <img
              src={`${BASE_URL}${formData.pathToPicture}`}
              alt="package"
              style={{ width: '150px', borderRadius: '8px' }}
            />
            <button type="button" className="delete-pic" onClick={handleDeleteImage}>
              ลบรูป
            </button>
          </div>
        )}

        {newImage && (
          <img
            src={URL.createObjectURL(newImage)}
            alt="preview"
            style={{ width: '150px', borderRadius: '8px', marginTop: '10px' }}
          />
        )}

        <input type="file" accept="image/*" onChange={handleImageChange} />

        { isSubmit ? (
          <div>กำลังโหลด...</div>
        ) : (
          <div className="modal-actions">
            <button onClick={onClose} className='mybtn btn-white'>ยกเลิก</button>
            <button onClick={handleDelete} className='mybtn btn-black'>ลบพัสดุ</button>
            <button onClick={handleSubmit} className='mybtn'>ยืนยัน</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageEditModal;
