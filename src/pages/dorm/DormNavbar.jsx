import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const Dorm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

  return (
    <div>
        <h1>หอพัก {id}</h1>
        <div className='tab'>
            <div className="peel-button peel-tab" onClick={() => navigate('/info')}>ข้อมูลหอพัก</div>
            <div className="peel-button peel-tab">QR Code</div>
            <div className="peel-button peel-tab">คำขอเข้าร่วมหอพัก</div>
            <div className="peel-button peel-tab">จัดการผู้ใช้งานในหอพัก</div>
            <div className="peel-button peel-tab">จัดการห้องพัก</div>
        </div>
        <div className='tab'>
            <div className="peel-button peel-tab">ข้อมูลหอพัก</div>
            <div className="peel-button peel-tab">รายการพัสดุทั้งหมด</div>
            <div className="peel-button peel-tab">นำจ่ายพัสดุ</div>
        </div>
        <div className='tab'>
            <div className="peel-button peel-tab">ข้อมูลหอพัก</div>
            <div className="peel-button peel-tab">QR Code รับพัสดุ</div>
            <div className="peel-button peel-tab">พัสดุของฉัน</div>
        </div>
    </div>
  )
}

export default Dorm