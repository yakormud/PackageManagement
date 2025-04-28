import React, { useRef, useState } from 'react';
import api from '../../utils/api';
import PackageScanner from './PackageScanner';

const AddPackage = () => {
    const [formData, setFormData] = useState({
        recipientName: 'นันทกร',
        recipientRoomNo: 'A101',
        trackingNo: '5678TH'
    });
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);


    const [scanning, setScanning] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = (e) => {
        e.preventDefault();
        setImage(null);
        setPreviewUrl('');
        fileInputRef.current.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitData = new FormData();
        submitData.append('recipientName', formData.recipientName);
        submitData.append('recipientRoomNo', formData.recipientRoomNo);
        submitData.append('trackingNo', formData.trackingNo);
        submitData.append('image', image);

        try {
            await api.post('/package/add', submitData);
            alert('เพิ่มพัสดุสำเร็จ');
            //setFormData({ recipientName: '', recipientRoomNo: '', trackingNo: '' });
            setFormData({
                recipientName: 'นันทกร',
                recipientRoomNo: 'A101',
                trackingNo: '5678TH'
            });
            setImage(null);
            setPreviewUrl('');
            fileInputRef.current.value = null;
        } catch (err) {
            console.error('Failed to add package:', err);
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">เพิ่มพัสดุใหม่</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="recipientRoomNo">ห้อง</label>
                    <input
                        id="recipientRoomNo"
                        name="recipientRoomNo"
                        value={formData.recipientRoomNo}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="recipientName">ชื่อผู้รับ</label>
                    <input
                        id="recipientName"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="trackingNo">Tracking No.</label>
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <input style={{ flex: '1' }}
                            id="trackingNo"
                            name="trackingNo"
                            value={formData.trackingNo}
                            onChange={handleChange}
                            className="form-input"
                        />
                        <button type="button" onClick={() => setScanning(true)}>แสกน</button>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="image">รูปพัสดุ</label>
                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="form-input"
                        ref={fileInputRef}
                    />
                </div>

                {previewUrl && (
                    <div className="form-group img-wrap">
                        <img src={previewUrl} alt="preview" className="img-preview" />
                        <button onClick={handleRemoveImage}>ลบรูปภาพ</button>
                    </div>
                )}

                <button type="submit" className="form-button">บันทึก</button>
            </form>


            {scanning && (
                <PackageScanner
                    onDetected={(code) => {
                        setFormData(prev => ({ ...prev, trackingNo: code }));
                        setScanning(false);
                    }}
                    onCancel={() => setScanning(false)}
                />
            )}
        </div>
    );
};

export default AddPackage;
