import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { BASE_URL } from '../../utils/api';
import DormEditModal from './DormEditModal';
import defaultPic from '../../assets/noimage.png'

const Dorm = () => {
  const { id } = useParams();
  const [dormData, setDormData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [userRole, setUserRole] = useState("");

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const verifyRes = await api.get('/user/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userID = verifyRes.data.user.id;
      console.log("USER ID: ", userID)

      const roleRes = await api.post('/dorm-user/getUserRoleByDorm', {
        userID: verifyRes.data.user.id,
        dormID: id
      });

      setUserRole(roleRes.data.role);
      console.log("USER ROLE:", roleRes.data.role)
    } catch (err) {
      navigate('/dashboard')
      console.error('Failed to determine user role:', err);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchDorm();
    fetchUserRole();
  }, [id]);

  const fetchDorm = async () => {
    try {
      const res = await api.get(`/dorm/info/${id}`);
      setDormData(res.data);
    } catch (err) {
      console.error('Error fetching dorm:', err);
    }
  };

  if (!dormData) return <div>Loading...</div>;



  return (
    <>
      <div>
        <div className="flex-between-menu">
          <h2 className='page-header'>ข้อมูลหอพัก</h2>
            { (userRole === 'admin' || userRole === 'owner') && <a onClick={() => setIsEditMode(true)} style={{cursor:"pointer"}}>แก้ไขรายละเอียด</a>}
        </div>
        <div className="dorm-detail">
          <div className="dorm-info-text">
            <p><strong>ชื่อหอพัก:</strong> {dormData.name}</p>
            <p><strong>ที่อยู่:</strong> {dormData.address}</p>
            <p><strong>เจ้าของหอพัก:</strong> {dormData.ownerName}</p>
            <p><strong>เบอร์ติดต่อ:</strong> {dormData.phoneNo}</p>
          </div>

          {dormData.pathToPicture ? (
            <img
              className="dorm-image"
              src={`${BASE_URL}${dormData.pathToPicture}`}
              alt="Dorm"
            />
          ) : (
            <img
              className="dorm-image"
              src={defaultPic}
              alt="Dorm"
            />
          )}
        </div>
      </div>
      {isEditMode && <DormEditModal dormData={dormData} setIsEditMode={setIsEditMode} refreshDorm={fetchDorm} role={userRole} />}
    </>


  );
};

export default Dorm;
