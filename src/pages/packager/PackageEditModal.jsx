import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../../utils/api';
import { useParams } from 'react-router-dom';

const PackageEditModal = ({ id, onClose }) => {
  const { id: dormID } = useParams();

  const [formData, setFormData] = useState({
    recipientID: '',
    recipientName: '',
    recipientRoomNo: '',
    trackingNo: '',
    pathToPicture: '',
  });

  const [rooms, setRooms] = useState([]);
  const [people, setPeople] = useState([]);

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
    } catch (err) {
      console.error('Failed to fetch package:', err);
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

  const fetchPeople = async () => {
    try {
      const res = await api.post('/dorm-user/getAllUser', { dormID });
      setPeople(res.data);
    } catch (err) {
      console.error('Failed to fetch people:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'recipientName') {
      const selectedPerson = people.find(p => p.fullName === value);
      setFormData(prev => ({
        ...prev,
        recipientName: value,
        recipientID: selectedPerson ? selectedPerson.userID : '',
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    console.log(formData)
  }, [formData])

  const handleSubmit = async () => {
    try {
      await api.post('/package/update', {
        ...formData,
        id,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update package:', err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>แก้ไขรายละเอียดพัสดุ</h3>

        <label htmlFor="recipientName">ชื่อผู้รับ</label>
        <select
          id='recipientName'
          name="recipientName"
          value={formData.recipientName}
          onChange={handleChange}
        >
          <option value="">เลือกชื่อผู้รับ</option>
          {people.map(p => (
            <option key={p.userID} value={p.fullName}>
              {p.fullName}
            </option>
          ))}
        </select>

        <label htmlFor="roomNo">หมายเลขห้อง</label>
        <select
          id='roomNo'
          name="recipientRoomNo"
          value={formData.recipientRoomNo}
          onChange={handleChange}
        >
          <option value="">เลือกห้อง</option>
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
        <div style={{ marginTop: '10px' }}>
          <img
            src={formData.pathToPicture ? `${BASE_URL}${formData.pathToPicture}` : `${BASE_URL}/packages/default.png`}
            alt="พัสดุ"
            style={{ width: '150px', borderRadius: '8px' }}
          />
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>ยกเลิก</button>
          <button onClick={handleSubmit}>ยืนยัน</button>
        </div>
      </div>
    </div>
  );
};

export default PackageEditModal;
