import React from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';

const DormLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const user = 'owner'; 
  //const user = 'manager';
  //const user = 'tenant';

  const isActive = (path) => location.pathname.endsWith(path);

  return (
    <div className='dorm-content'>
      <div className="dorm-navbar">
        <div className="dorm-name">
          <h2>หอพัก {id}</h2>
        </div>

        <div className='nav-link'>
          {user === 'owner' ? (
            <>
              <a onClick={() => navigate('./info')} className={`peel-tab ${isActive('info') ? 'peel-active' : ''}`}>ข้อมูลหอพัก</a>
              <a onClick={() => navigate('./qrinvite')} className={`peel-tab ${isActive('qrinvite') ? 'peel-active' : ''}`}>QR Code</a>
              <a onClick={() => navigate('./requests')} className={`peel-tab ${isActive('requests') ? 'peel-active' : ''}`}>คำขอเข้าร่วมหอพัก</a>
              <a onClick={() => navigate('./users')} className={`peel-tab ${isActive('users') ? 'peel-active' : ''}`}>จัดการผู้ใช้งานในหอพัก</a>
              <a onClick={() => navigate('./rooms')} className={`peel-tab ${isActive('rooms') ? 'peel-active' : ''}`}>จัดการห้องพัก</a>
            </>
          ) : user === 'manager' ? (
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
