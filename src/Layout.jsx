import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();

  return (
    <div className="page">
      
      <div className="navbar">
        <span className='nav-logo' onClick={() => navigate('dashboard')}>📦 แอปพลิเคชันจัดการพัสดุ</span>
        {/* <button className='circle-button'><FontAwesomeIcon icon={faArrowRightFromBracket}/></button> */}
        <button className='peel-button' style={{fontSize:"1rem"}} onClick={()=> navigate('/login')}>ออกจากระบบ</button>
      </div>

      
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
