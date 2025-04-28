import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api , { BASE_URL} from '../../utils/api';
import DormEditModal from './DormEditModal';

const Dorm = () => {
  const { id } = useParams();
  const [dormData, setDormData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchDorm();
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

  return isEditMode ? (
    <DormEditModal dormData={dormData} setIsEditMode={setIsEditMode} refreshDorm={fetchDorm} />
  ) : (
    <div>
      <div className="flex-between-menu">
        <h2 className='page-header'>ข้อมูลหอพัก</h2>
        <a onClick={() => setIsEditMode(true)}>แก้ไขรายละเอียด</a>
      </div>
      <div className="dorm-detail">
        <div className="dorm-info-text">
          <p><strong>ชื่อหอพัก:</strong> {dormData.name}</p>
          <p><strong>ที่อยู่:</strong> {dormData.address}</p>
          <p><strong>เจ้าของหอพัก:</strong> {dormData.ownerName}</p>
          <p><strong>เบอร์ติดต่อ:</strong> {dormData.phoneNo}</p>
        </div>

        {dormData.pathToPicture && (
          <img
            className="dorm-image"
            src={`${BASE_URL}${dormData.pathToPicture}`}
            alt="Dorm"
          />
        )}
      </div>
    </div>
  );
};

export default Dorm;
