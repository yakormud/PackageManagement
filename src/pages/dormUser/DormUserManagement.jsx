import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import UserEditModal from './UserEditModal';

const DormUserManagement = () => {
  const { id } = useParams();
  const [selectedRole, setSelectedRole] = useState('tenant');
  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.post('/dorm-user/getByDormAndRole', {
        dormID: id,
        role: selectedRole,
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [id, selectedRole]);

  return (
    <div>
      <h2>จัดการผู้ใช้งานในหอพัก</h2>

      <div className="line-wrap">
        <div
          className={`line-item ${selectedRole === 'tenant' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('tenant')}
        >
          ผู้เช่า
        </div>
        <div
          className={`line-item ${selectedRole === 'package_manager' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('package_manager')}
        >
          เจ้าหน้าที่พัสดุ
        </div>
        <div
          className={`line-item ${selectedRole === 'admin' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('admin')}
        >
          ผู้ดูแล
        </div>
      </div>

      <h3>ผู้ใช้ทั้งหมด</h3>
      {users.map((user) => (
        <div className="user-card" key={user.id}>
          <div className="user-info">
            <p>
              {user.roomID ? <strong>{user.roomID}</strong> : null} {user.fullName}
            </p>
          </div>
          <div className="user-action" onClick={()=> {
            setSelectedUser(user.id);
            setShowModal(true)
          }}>
            <button className="go-button">จัดการ</button>
          </div>
        </div>
      ))}

      {showModal &&
        <UserEditModal id={selectedUser} onClose={()=> {
          setShowModal(false)
          setSelectedUser('');
          fetchUsers()
        }} />
      }
    </div>
  );
};

export default DormUserManagement;
