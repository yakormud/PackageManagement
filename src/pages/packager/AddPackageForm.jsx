import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import Select from 'react-select';

const AddPackageForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const trackingNo = queryParams.get('trackingNo');
  const { id: dormID } = useParams();

  const [recipientName, setRecipientName] = useState('');
  const [recipientRoomNo, setRecipientRoomNo] = useState('');
  const [recipientID, setRecipientID] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [roomOptions, setRoomOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    const fetchRoomsAndUsers = async () => {
      try {
        const [roomRes, userRes] = await Promise.all([
          api.get(`/dropdown/rooms/${dormID}`),
          api.get(`/dropdown/users/${dormID}`)
        ]);

        setRoomOptions(roomRes.data);
        setUserOptions(userRes.data);
        console.log('Room options:', roomRes.data);
        console.log('User options:', userRes.data);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };

    fetchRoomsAndUsers();
  }, [dormID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientName || !recipientRoomNo || !recipientID) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('dormID', dormID);
      formData.append('recipientName', recipientName);
      formData.append('recipientRoomNo', recipientRoomNo);
      formData.append('recipientID', recipientID);
      formData.append('trackingNo', trackingNo);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.post('/package/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('เพิ่มพัสดุสำเร็จ');
      navigate(-1);
    } catch (err) {
      console.error('Error adding package:', err);
      alert('เกิดข้อผิดพลาดในการเพิ่มพัสดุ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
      <h2 style={{ textAlign: 'center' }}>เพิ่มพัสดุ</h2>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <p>หมายเลขพัสดุ {trackingNo}</p>
        <p className='edit-track' onClick={() => navigate(-1)} style={{ marginLeft: 10, cursor: 'pointer', color: 'blue' }}>
          แก้ไข
        </p>
      </div>


      <div style={{ marginBottom: 20 }}>
        <label>ค้นหาผู้รับ:</label>
        <Select
          options={userOptions.map(user => ({
            label: user.label,
            value: user.fullName,
            roomNo: user.roomNo || '',
            userDormID: user.userDormID
          }))}
          onChange={(selected) => {
            setRecipientName(selected.value);
            setRecipientRoomNo(selected.roomNo);
            setRecipientID(selected.userDormID);
          }}
          placeholder="ค้นหาชื่อผู้รับ"
          isSearchable
        />
      </div>


      {recipientID && (
        <form onSubmit={handleSubmit}>
          {/* ชื่อผู้รับ */}
          <div style={{ marginBottom: 10 }}>
            <label>ชื่อผู้รับ:</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value)
                setRecipientID(0)
              }}
              required
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          {/* หมายเลขห้อง */}
          <div style={{ marginBottom: 10 }}>
            <label>หมายเลขห้อง:</label>
            <select
              value={recipientRoomNo}
              onChange={(e) => setRecipientRoomNo(e.target.value)}
              required
              style={{ width: '100%', padding: 8 }}
            >
              <option value="">-- เลือกห้อง --</option>
              {roomOptions.map(room => (
                <option key={room.id} value={room.roomNo}>
                  {room.roomNo}
                </option>
              ))}
            </select>
          </div>

          {/* รูปภาพพัสดุ */}
          <div style={{ marginBottom: 10 }}>
            <label>รูปภาพพัสดุ:</label>
            <label style={{ cursor: 'pointer', marginTop: 5 }}>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />
            </label>

            {/* Preview */}
            {imageFile && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: 14 }}>รูปที่เลือก:</p>
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="preview"
                  style={{ width: '100%', maxWidth: 300, borderRadius: 8 }}
                />
              </div>
            )}
          </div>


          <button type="submit" className="mybtn" disabled={submitting}>
            {submitting ? 'กำลังส่ง...' : 'เพิ่มพัสดุ'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddPackageForm;
