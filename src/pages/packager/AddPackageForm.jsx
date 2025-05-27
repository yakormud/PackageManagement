import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import CreatableSelect from 'react-select/creatable';
import Swal from 'sweetalert2';

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
      console.log(recipientName)
      console.log(recipientID)
      console.log(recipientRoomNo)
      await Swal.fire({
        icon: 'info',
        title: 'เกิดข้อผิดพลาด',
        text: 'กรุณากรอกข้อมูลให้ครบ',
      });
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

      const result = await Swal.fire({
        title: 'เพิ่มพัสดุสำเร็จ 🎉',
        text: 'คุณต้องการเพิ่มพัสดุต่อหรือไม่?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'เพิ่มต่อ',
        cancelButtonText: 'ไปหน้าพัสดุทั้งหมด',
      });

      if (result.isConfirmed) {
        navigate(-1);
      } else {
        navigate(`/dorm/${dormID}/allpackage`);
      }
    } catch (err) {
      console.error('Error adding package:', err);
      alert(err);

      let errorMsg = 'เกิดข้อผิดพลาด';

      if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      } else if (typeof err === 'string') {
        errorMsg = err;
      }

      await Swal.fire({
        icon: 'error',
        title: 'ล้มเหลว',
        text: errorMsg,
      });
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

        <CreatableSelect
          options={userOptions.map(user => ({
            label: user.label,
            value: user.fullName,
            roomNo: user.roomNo || '',
            userDormID: user.userDormID
          }))}
          onChange={(selected) => {
            if (!selected) {
              setRecipientID(null);
              setRecipientName('');
              setRecipientRoomNo('');
              return;
            }


            //ตอนสร้างใหม่
            if (selected.__isNew__) {
              setRecipientName(selected.value);
              setRecipientID(-99);
              setRecipientRoomNo('ไม่ระบุ');
            } else {
              setRecipientName(selected.value);
              setRecipientRoomNo(selected.roomNo);
              setRecipientID(selected.userDormID);
            }
          }}
          placeholder="ค้นหาหรือเพิ่มชื่อผู้รับ"
          isClearable
          isSearchable
          formatCreateLabel={(input) => `เพิ่มชื่อใหม่: "${input}"`}
        />
      </div>


      {recipientID !== null && (
        <form onSubmit={handleSubmit}>
          {/* recipientID = 0 คือไม่มีในระบบ */}
          {recipientID === 0 || recipientID === -99 && (
            <>
              <div style={{ marginBottom: 10 }}>
                <label>ชื่อผู้รับ:</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  style={{ width: '100%', padding: 8 }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>หมายเลขห้อง:</label>
                <select
                  value={recipientRoomNo}
                  onChange={(e) => setRecipientRoomNo(e.target.value)}
                  required
                  style={{ width: '100%', padding: 8 }}
                >
                  <option value="">-- เลือกห้อง --</option>
                  <option value="ไม่ระบุ">ไม่ระบุ</option>
                  {roomOptions.map(room => (
                    <option key={room.id} value={room.roomNo}>{room.roomNo}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* มี recipientID = มีในระบบ */}
          {recipientID !== 0 && recipientID !== -99 && (
            <>
              <div style={{ marginBottom: 10 }}>
                <label>ชื่อผู้รับ:</label>
                <input type="text" value={recipientName} readOnly style={{ width: '100%', padding: 8 }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label>หมายเลขห้อง:</label>
                <input type="text" value={recipientRoomNo} readOnly style={{ width: '100%', padding: 8 }} />
              </div>
            </>
          )}

          {/* อัปโหลดรูปภาพ */}
          <div style={{ marginBottom: 10 }}>
            <label>รูปภาพพัสดุ:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            {imageFile && (
              <div style={{ marginTop: 10 }}>
                <img src={URL.createObjectURL(imageFile)} alt="preview" style={{ width: '100%', maxWidth: 300, borderRadius: 8 }} />
              </div>
            )}
          </div>

          <button type="submit" className="mybtn btn-full-width" disabled={submitting} style={{ paddingTop: "10px", marginBottom: "80px" }}>
            {submitting ? 'กำลังส่ง...' : 'เพิ่มพัสดุ'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddPackageForm;
