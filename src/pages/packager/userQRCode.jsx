import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import api from '../../utils/api';

const UserQRCode = ({ id, onClose }) => {

    const [code , setCode] = useState('');

    useEffect(() => {
        console.log(id)
        fetchUserCode();
    }, [id]);

    const fetchUserCode = async () => {
        if (!id) return; 
    
        try {
            const res = await api.get(`/dorm-user/getUserCode/${id}`);
            setCode(res.data.code);  
            console.log(res.data)
        } catch (err) {
            console.error('Failed to fetch package:', err);
        }
    };
    

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>QR Code ของคุณ</h3>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                    <QRCode value={code} size={300} />
                </div>
                <p>รหัส QR Code: {code}</p>
                <button className="modal-button" onClick={onClose}>ปิด</button>
            </div>
        </div>
    );
};

export default UserQRCode;
