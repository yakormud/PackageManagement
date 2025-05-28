import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../utils/api';

const DormLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [userRole, setUserRole] = useState(null);

  const isActive = (path) => location.pathname.endsWith(path);

  useEffect(() => {
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
        console.log("USER ROLE: ", roleRes.data.role )
      } catch (err) {
        navigate('/dashboard')
        console.error('Failed to determine user role:', err);
      }
    };

    fetchUserRole();
  }, [id]);

  return (
    <div className='dorm-content'>
      <div className="dorm-navbar">
        <div className="dorm-name">
          <h2>หอพัก {id}</h2>
        </div>

        <div className='nav-link'>
          {(userRole === 'owner' || userRole === 'admin') ? (
            <>
              <a onClick={() => navigate('./info')} className={`peel-tab ${isActive('info') ? 'peel-active' : ''}`}>ข้อมูลหอพัก</a>
              <a onClick={() => navigate('./qrinvite')} className={`peel-tab ${isActive('qrinvite') ? 'peel-active' : ''}`}>QR Code</a>
              <a onClick={() => navigate('./requests')} className={`peel-tab ${isActive('requests') ? 'peel-active' : ''}`}>คำขอเข้าร่วมหอพัก</a>
              <a onClick={() => navigate('./users')} className={`peel-tab ${isActive('users') ? 'peel-active' : ''}`}>จัดการผู้ใช้งานในหอพัก</a>
              <a onClick={() => navigate('./rooms')} className={`peel-tab ${isActive('rooms') ? 'peel-active' : ''}`}>จัดการห้องพัก</a>
            </>
          ) : userRole === 'package_manager' ? (
            <>
              <a onClick={() => navigate('./info')} className={`peel-tab ${isActive('info') ? 'peel-active' : ''}`}>ข้อมูลหอพัก</a>
              <a onClick={() => navigate('./allpackage')} className={`peel-tab ${isActive('allpackage') ? 'peel-active' : ''}`}>รายการพัสดุทั้งหมด</a>
              <a onClick={() => navigate('./deliver')} className={`peel-tab ${isActive('deliver') ? 'peel-active' : ''}`}>นำจ่ายพัสดุ</a>
              <a onClick={() => navigate('./addpackage')} className={`peel-tab ${isActive('addpackage') ? 'peel-active' : ''}`}>เพิ่มพัสดุ</a>
            </>
          ) : (
            <>
              <p onClick={() => navigate('./info')} className={`peel-tab ${isActive('info') ? 'peel-active' : ''}`}>ข้อมูลหอพัก</p>
              <p onClick={() => navigate('./myqrcode')} className={`peel-tab ${isActive('myqrcode') ? 'peel-active' : ''}`}>QR Code รับพัสดุ</p>
              <p onClick={() => navigate('./mypackage')} className={`peel-tab ${isActive('mypackage') ? 'peel-active' : ''}`}>พัสดุของฉัน</p>
            </>
          )}
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default DormLayout;
