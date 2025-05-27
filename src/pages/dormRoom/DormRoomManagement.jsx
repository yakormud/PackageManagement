import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import RoomEditModal from './RoomEditModal';
import RoomAddModal from './RoomAddModal';

const DormRoomManagement = () => {
  const { id } = useParams();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await api.get(`/dorm-room/getAllRoom/${id}`);
      setRooms(res.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [id]);

  return (
    <div>
      <div className="flex-between-menu">
        <h2>จัดการห้องพัก</h2>
        <a onClick={() => setShowAddModal(true)} style={{cursor:"pointer"}}>เพิ่มห้องพัก</a>
      </div>

      {rooms.map(room => (
        <div className="user-card" key={room.id}>
          <div className="user-info">
            <p>{room.roomNo}</p>
          </div>
          <div className="user-action">
            <button className="go-button" onClick={() => setSelectedRoom(room)}>จัดการ</button>
          </div>
        </div>
      ))}

      {selectedRoom && (
        <RoomEditModal
          roomData={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onRefresh={fetchRooms}
        />
      )}

      {showAddModal && (
        <RoomAddModal
          dormID={id}
          onClose={() => setShowAddModal(false)}
          onRefresh={fetchRooms}
        />
      )}
    </div>
  );
};

export default DormRoomManagement;
